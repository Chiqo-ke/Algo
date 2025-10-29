import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string | undefined;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  if (!content) return null;
  
  return (
    <div className={cn('prose prose-xs prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className='text-lg font-bold mb-2 mt-3' {...props} />,
          h2: ({ node, ...props }) => <h2 className='text-base font-semibold mb-1.5 mt-2.5' {...props} />,
          h3: ({ node, ...props }) => <h3 className='text-sm font-semibold mb-1.5 mt-2' {...props} />,
          ul: ({ node, ...props }) => <ul className='list-disc list-inside my-1.5 space-y-0.5 text-xs' {...props} />,
          ol: ({ node, ...props }) => <ol className='list-decimal list-inside my-1.5 space-y-0.5 text-xs' {...props} />,
          li: ({ node, ...props }) => <li className='ml-2 text-xs' {...props} />,
          p: ({ node, ...props }) => <p className='mb-1.5 leading-relaxed text-xs' {...props} />,
          strong: ({ node, ...props }) => <strong className='font-bold text-primary' {...props} />,
          em: ({ node, ...props }) => <em className='italic' {...props} />,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return match ? (
              <code className='block bg-muted p-2 rounded-md my-1.5 overflow-x-auto text-[10px]' {...props}>{children}</code>
            ) : (
              <code className='bg-muted px-1 py-0.5 rounded text-[10px] font-mono' {...props}>{children}</code>
            );
          },
          blockquote: ({ node, ...props }) => <blockquote className='border-l-4 border-primary pl-3 italic my-1.5 opacity-90 text-xs' {...props} />,
          a: ({ node, ...props }) => <a className='text-primary underline hover:text-primary/80 transition-colors text-xs' target='_blank' rel='noopener noreferrer' {...props} />,
          hr: ({ node, ...props }) => <hr className='my-3 border-border' {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
