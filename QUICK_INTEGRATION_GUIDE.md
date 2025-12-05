# Quick Integration Guide: Dashboard.tsx Updates

## Step 1: Replace the code generation logic in `handleConfirmAndProceed`

Find this section (around line 710):
```typescript
// Generate executable code from canonical JSON
console.log("🔧 Generating executable strategy code...");

try {
  const codeGenResult = await apiCall(
    `${API_BASE_URL}/api/strategies/api/generate_executable_code/`,
    // ... rest of old code
```

Replace the entire `try-catch` block for code generation with:

```typescript
// Generate executable code with automatic error fixing
console.log("🔧 Generating executable strategy code with auto-fix...");

// Show progress dialog
setShowCodeGenProgress(true);
setShowConfirmDialog(false);

// Register progress callback
codeGenerationService.onProgress((progress) => {
  setCodeGenProgress(progress);
});

try {
  // Use the new service with auto-fixing
  const result = await codeGenerationService.generateWithAutoFix({
    canonical_json: confirmationData.canonicalJson,
    strategy_name: editedStrategyName.trim(),
    strategy_id: confirmationData.strategyId,
    max_fix_attempts: 3,
    auto_fix_enabled: true,
  });

  // Clear callbacks
  codeGenerationService.clearProgressCallbacks();

  if (result.success && result.validation_passed) {
    console.log("✅ Code validated and ready!");
    
    toast({
      title: "Strategy Ready",
      description: `${editedStrategyName} passed all validations! ${result.fix_attempts ? `Fixed after ${result.fix_attempts} attempt(s).` : ''}`,
    });

    setShowCodeGenProgress(false);

    // Navigate to backtesting
    navigate(`/backtesting/${confirmationData.strategyId}`, {
      state: {
        strategyId: confirmationData.strategyId,
        strategyName: editedStrategyName.trim(),
        codeFilePath: result.file_path,
        codeFileName: result.file_name,
        backtestConfig: {
          symbol: backtestSymbol,
          period: backtestPeriod,
          interval: backtestInterval
        }
      }
    });
  } else {
    console.error("❌ Code generation/validation failed");
    
    setShowCodeGenProgress(false);
    setShowConfirmDialog(true); // Show dialog again for retry
    
    toast({
      title: "Code Generation Failed",
      description: result.error || `Failed after ${result.fix_attempts || 0} fix attempts`,
      variant: "destructive",
    });
  }
} catch (codeGenError) {
  console.error("❌ Code generation error:", codeGenError);
  
  codeGenerationService.clearProgressCallbacks();
  setShowCodeGenProgress(false);
  setShowConfirmDialog(true);
  
  toast({
    title: "Error",
    description: codeGenError instanceof Error ? codeGenError.message : "Code generation failed",
    variant: "destructive",
  });
}
```

## Step 2: Add Progress Dialog to JSX

Find the JSX section with other dialogs (around line 1500+), and add this dialog:

```tsx
{/* Code Generation Progress Dialog */}
<Dialog open={showCodeGenProgress} onOpenChange={(open) => {
  // Prevent closing during generation
  if (!open && codeGenProgress?.status !== 'completed' && codeGenProgress?.status !== 'failed') {
    toast({
      title: "Please wait",
      description: "Code generation in progress...",
    });
    return;
  }
  setShowCodeGenProgress(open);
}}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Generating Strategy Code</DialogTitle>
      <DialogDescription>
        Please wait while we generate and validate your strategy code. This may take a few moments...
      </DialogDescription>
    </DialogHeader>
    
    {codeGenProgress && (
      <CodeGenerationStatus progress={codeGenProgress} className="mt-4" />
    )}
    
    {codeGenProgress?.status === 'failed' && (
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => {
            setShowCodeGenProgress(false);
            setShowConfirmDialog(true);
          }}
        >
          Go Back
        </Button>
        <Button 
          onClick={() => {
            // Retry generation
            handleConfirmAndProceed();
          }}
        >
          Retry
        </Button>
      </DialogFooter>
    )}
  </DialogContent>
</Dialog>
```

## Step 3: Update the code generation section in the else block (strategy creation)

Find the similar code generation logic in the else block (around line 900), and make the same replacement there.

The pattern is identical:
1. Show progress dialog
2. Register callback
3. Call `codeGenerationService.generateWithAutoFix()`
4. Handle result
5. Clear callbacks
6. Navigate only if `validation_passed === true`

## Complete Example for the "else" block:

```typescript
// Generate executable code from canonical JSON
console.log("🔧 Generating executable strategy code with auto-fix...");

// Show progress dialog
setShowCodeGenProgress(true);
setShowConfirmDialog(false);

// Register progress callback
codeGenerationService.onProgress((progress) => {
  setCodeGenProgress(progress);
});

try {
  const result = await codeGenerationService.generateWithAutoFix({
    canonical_json: confirmationData.canonicalJson,
    strategy_name: editedStrategyName.trim(),
    strategy_id: data.id, // Note: use data.id here (newly created strategy)
    max_fix_attempts: 3,
    auto_fix_enabled: true,
  });

  codeGenerationService.clearProgressCallbacks();

  if (result.success && result.validation_passed) {
    toast({
      title: "Strategy Ready",
      description: `${editedStrategyName} is ready! ${result.fix_attempts ? `Fixed after ${result.fix_attempts} attempt(s).` : ''}`,
    });

    setShowCodeGenProgress(false);

    navigate(`/backtesting/${data.id}`, {
      state: {
        strategyId: data.id,
        strategyName: editedStrategyName.trim(),
        codeFilePath: result.file_path,
        codeFileName: result.file_name,
        fromNewStrategy: true,
        backtestConfig: {
          symbol: backtestSymbol,
          period: backtestPeriod,
          interval: backtestInterval
        }
      }
    });
  } else {
    setShowCodeGenProgress(false);
    
    toast({
      title: "Strategy Saved",
      description: `${editedStrategyName} saved but code generation failed. Redirecting to strategies page...`,
    });

    navigate('/strategy', {
      state: {
        newStrategyId: data.id,
        newStrategyName: editedStrategyName.trim(),
        showSuccessMessage: true
      }
    });
  }
} catch (codeGenError) {
  console.error("❌ Code generation error:", codeGenError);
  
  codeGenerationService.clearProgressCallbacks();
  setShowCodeGenProgress(false);

  toast({
    title: "Strategy Saved",
    description: `${editedStrategyName} saved. Redirecting to strategies page...`,
  });

  navigate('/strategy', {
    state: {
      newStrategyId: data.id,
      newStrategyName: editedStrategyName.trim(),
      showSuccessMessage: true
    }
  });
}
```

## Testing

After making these changes:

1. **Test with valid strategy**:
   - Progress dialog should show briefly
   - Status: Generating → Validating → Completed
   - Navigate to backtesting immediately

2. **Test with strategy that has errors**:
   - Progress dialog should show
   - Status: Generating → Validating → Fixing Errors
   - Watch attempt counter (1/3, 2/3, 3/3)
   - Either succeeds and navigates, or fails and shows retry option

3. **Test error handling**:
   - Disconnect backend
   - Observe error handling and ability to retry

## Key Points

✅ **Navigation ONLY happens when `validation_passed === true`**
✅ **Progress is shown in real-time during fixing**
✅ **User cannot close dialog during active generation**
✅ **Retry option available on failure**
✅ **Clear error messages**
✅ **Backend iterates until code works or max attempts reached**

## Result

The frontend now properly waits for the backend agent to complete all error-fixing iterations before proceeding to backtesting, solving the 400 error issue where validation was failing but the UI was navigating anyway.
