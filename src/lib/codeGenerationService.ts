import { API_ENDPOINTS, apiPost } from './api';
import type { CodeGenerationResponse, CodeGenerationProgress, ErrorFixAttempt } from './types';

/**
 * Code Generation Service with Iterative Error Fixing
 * 
 * This service handles strategy code generation with automatic error detection and fixing.
 * It provides progress updates during the multi-step process:
 * 1. Generate initial code
 * 2. Validate code safety
 * 3. If errors exist, iterate through fixes
 * 4. Return final working code or error report
 */

export interface CodeGenerationRequest {
  canonical_json: any;
  strategy_name: string;
  strategy_id?: number;
  max_fix_attempts?: number;
  auto_fix_enabled?: boolean;
}

export class CodeGenerationService {
  private progressCallbacks: Array<(progress: CodeGenerationProgress) => void> = [];
  
  /**
   * Register a callback to receive progress updates
   */
  onProgress(callback: (progress: CodeGenerationProgress) => void): void {
    this.progressCallbacks.push(callback);
  }
  
  /**
   * Clear all progress callbacks
   */
  clearProgressCallbacks(): void {
    this.progressCallbacks = [];
  }
  
  /**
   * Notify all registered callbacks of progress
   */
  private notifyProgress(progress: CodeGenerationProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }
  
  /**
   * Generate strategy code with automatic error fixing
   * 
   * This method:
   * 1. Generates initial code
   * 2. Validates the code
   * 3. If validation fails, iteratively fixes errors
   * 4. Returns final result with full history
   */
  async generateWithAutoFix(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const maxAttempts = request.max_fix_attempts || 3;
    let currentAttempt = 0;
    const fixHistory: Array<{
      attempt: number;
      error_type: string;
      success: boolean;
      error_message?: string;
      timestamp?: string;
    }> = [];
    
    try {
      // Step 1: Generate initial code
      this.notifyProgress({
        status: 'generating',
        current_step: 'Generating initial strategy code...',
        progress_percentage: 10,
        current_attempt: 0,
        max_attempts: maxAttempts,
      });
      
      const { data: codeGenData, error: codeGenError } = await apiPost<CodeGenerationResponse>(
        API_ENDPOINTS.strategies.generateExecutableCode,
        {
          canonical_json: request.canonical_json,
          strategy_name: request.strategy_name,
          strategy_id: request.strategy_id,
        }
      );
      
      if (codeGenError || !codeGenData) {
        throw new Error(codeGenError || 'Code generation failed');
      }
      
      this.notifyProgress({
        status: 'validating',
        current_step: 'Code generated, validating safety...',
        progress_percentage: 30,
        current_attempt: 0,
        max_attempts: maxAttempts,
      });
      
      // Step 2: Validate generated code
      const validationResult = await this.validateGeneratedCode(codeGenData.strategy_code || '');
      
      if (validationResult.safe) {
        // Code is valid!
        this.notifyProgress({
          status: 'completed',
          current_step: 'Code validation passed! Ready for backtesting.',
          progress_percentage: 100,
          current_attempt: 0,
          max_attempts: maxAttempts,
          final_code: codeGenData.strategy_code,
          file_path: codeGenData.file_path,
          file_name: codeGenData.file_name,
        });
        
        return {
          ...codeGenData,
          success: true,
          validation_passed: true,
          fix_attempts: 0,
          fix_history: [],
        };
      }
      
      // Step 3: Auto-fix is disabled, return validation failure
      if (!request.auto_fix_enabled) {
        this.notifyProgress({
          status: 'failed',
          current_step: 'Code validation failed. Auto-fix is disabled.',
          progress_percentage: 100,
          error_message: validationResult.message || 'Code contains errors',
        });
        
        return {
          success: false,
          error: 'Code validation failed',
          details: validationResult.message || 'Code contains unsafe patterns',
          validation_passed: false,
          fix_attempts: 0,
          fix_history: [],
        };
      }
      
      // Step 4: Iterative error fixing
      let currentCode = codeGenData.strategy_code || '';
      let isFixed = false;
      
      while (currentAttempt < maxAttempts && !isFixed) {
        currentAttempt++;
        
        this.notifyProgress({
          status: 'fixing_errors',
          current_step: `Fixing code errors (Attempt ${currentAttempt}/${maxAttempts})...`,
          progress_percentage: 30 + (currentAttempt / maxAttempts) * 60,
          current_attempt: currentAttempt,
          max_attempts: maxAttempts,
        });
        
        try {
          // Call backend error fixing endpoint
          const { data: fixData, error: fixError } = await apiPost<any>(
            `${API_ENDPOINTS.strategies.list}${request.strategy_id}/fix_errors/`,
            {
              max_attempts: 1, // Fix one error at a time
            }
          );
          
          if (fixError || !fixData) {
            fixHistory.push({
              attempt: currentAttempt,
              error_type: 'fix_error',
              success: false,
              error_message: fixError || 'Fix attempt failed',
              timestamp: new Date().toISOString(),
            });
            continue;
          }
          
          if (fixData.success && fixData.final_path) {
            // Successfully fixed!
            isFixed = true;
            currentCode = fixData.fixed_code || currentCode;
            
            fixHistory.push({
              attempt: currentAttempt,
              error_type: fixData.error_type || 'unknown',
              success: true,
              timestamp: new Date().toISOString(),
            });
            
            this.notifyProgress({
              status: 'completed',
              current_step: `Code fixed successfully after ${currentAttempt} attempt(s)!`,
              progress_percentage: 100,
              current_attempt: currentAttempt,
              max_attempts: maxAttempts,
              final_code: currentCode,
              file_path: fixData.final_path,
            });
            
            return {
              success: true,
              strategy_code: currentCode,
              file_path: fixData.final_path,
              file_name: request.strategy_name + '.py',
              strategy_id: request.strategy_id,
              message: `Code fixed successfully after ${currentAttempt} attempt(s)`,
              validation_passed: true,
              fix_attempts: currentAttempt,
              fix_history: fixHistory,
            };
          }
          
          // Fix attempt failed
          fixHistory.push({
            attempt: currentAttempt,
            error_type: fixData.error_type || 'unknown',
            success: false,
            error_message: fixData.error_message,
            timestamp: new Date().toISOString(),
          });
          
        } catch (fixAttemptError) {
          fixHistory.push({
            attempt: currentAttempt,
            error_type: 'exception',
            success: false,
            error_message: fixAttemptError instanceof Error ? fixAttemptError.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
      }
      
      // Max attempts reached without success
      this.notifyProgress({
        status: 'failed',
        current_step: `Failed to fix code after ${maxAttempts} attempts`,
        progress_percentage: 100,
        current_attempt: currentAttempt,
        max_attempts: maxAttempts,
        error_message: 'Maximum fix attempts reached',
      });
      
      return {
        success: false,
        strategy_code: currentCode,
        error: 'Failed to fix code errors',
        details: `Attempted ${currentAttempt} fixes but code still contains errors`,
        validation_passed: false,
        fix_attempts: currentAttempt,
        fix_history: fixHistory,
      };
      
    } catch (error) {
      this.notifyProgress({
        status: 'failed',
        current_step: 'Code generation failed',
        progress_percentage: 100,
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return {
        success: false,
        error: 'Code generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        validation_passed: false,
        fix_attempts: currentAttempt,
        fix_history: fixHistory,
      };
    }
  }
  
  /**
   * Validate generated code for safety
   */
  private async validateGeneratedCode(code: string): Promise<{
    safe: boolean;
    message?: string;
    issues?: string[];
  }> {
    try {
      const { data, error } = await apiPost<{
        status: string;
        safe: boolean;
        message: string;
        issues?: string[];
      }>(
        API_ENDPOINTS.production.strategies.validateCode,
        { code }
      );
      
      if (error || !data) {
        return {
          safe: false,
          message: error || 'Validation failed',
        };
      }
      
      return {
        safe: data.safe,
        message: data.message,
        issues: data.issues,
      };
    } catch (error) {
      return {
        safe: false,
        message: error instanceof Error ? error.message : 'Validation error',
      };
    }
  }
}

// Singleton instance
export const codeGenerationService = new CodeGenerationService();
