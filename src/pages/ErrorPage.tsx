import { useParams, useNavigate } from "react-router-dom";

const ERROR_META: Record<string, { title: string; description: string }> = {
  "400": {
    title: "Bad Request",
    description: "The request could not be understood by the server.",
  },
  "401": {
    title: "Unauthorized",
    description: "You are not authorized to access this resource.",
  },
  "403": {
    title: "Forbidden",
    description: "Access to this resource is denied.",
  },
  "404": {
    title: "Not Found",
    description: "The resource you requested could not be found.",
  },
  "408": {
    title: "Request Timeout",
    description: "The server timed out waiting for the request.",
  },
  "429": {
    title: "Too Many Requests",
    description: "You have sent too many requests. Please try again later.",
  },
  "500": {
    title: "Internal Server Error",
    description: "Something went wrong on our end. Please try again later.",
  },
  "502": {
    title: "Bad Gateway",
    description: "The server received an invalid response. Please try again.",
  },
  "503": {
    title: "Service Unavailable",
    description: "The service is temporarily unavailable. Please try again later.",
  },
  "504": {
    title: "Gateway Timeout",
    description: "The server did not respond in time. Please try again.",
  },
};

const FALLBACK = {
  title: "Unexpected Error",
  description: "An unexpected error occurred. Please try again.",
};

interface ErrorPageProps {
  code?: string;
}

const ErrorPage = ({ code: propCode }: ErrorPageProps = {}) => {
  const params = useParams<{ code: string }>();
  const navigate = useNavigate();
  const code = propCode ?? params.code ?? "500";
  const meta = ERROR_META[code] ?? FALLBACK;

  const is5xx = code.startsWith("5");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground select-none">
      <div className="flex flex-col items-center gap-6 text-center px-4">
        {/* Error code */}
        <span className="text-[8rem] font-black leading-none tracking-tighter text-primary opacity-20 pointer-events-none">
          {code}
        </span>

        {/* Title & description */}
        <div className="-mt-8 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
          <p className="text-sm text-muted-foreground max-w-sm">{meta.description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-2">
          {is5xx && (
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
