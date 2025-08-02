import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription, AlertTitle } from "./alert";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = "Something went wrong",
  message,
  retry,
  className,
}: ErrorDisplayProps) {
  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p>{message}</p>
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="h-8"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Try again
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}