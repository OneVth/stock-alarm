"use client";

import * as React from "react";
import { AlertCircle, Loader2, Terminal } from "lucide-react";
import { toast } from "sonner";
import { ComponentSection } from "../_components/component-section";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedbackShowcase() {
  const [progress, setProgress] = React.useState(33);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback & Status</h1>
        <p className="mt-2 text-muted-foreground">6 components</p>
      </div>

      <ComponentSection
        title="Alert"
        description="Important information notification (default, destructive)"
      >
        <div className="space-y-4">
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              You can add components and dependencies to your app using the CLI.
            </AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Your session has expired. Please log in again.
            </AlertDescription>
          </Alert>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Alert Dialog"
        description="Confirmation modal for critical actions"
      >
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" />}>
            Delete Stock
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                stock alert and remove all related data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ComponentSection>

      <ComponentSection
        title="Toast (Sonner)"
        description="Temporary notification message (success, error, warning, action)"
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Stock alert saved successfully.")}
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.error("Failed to save stock alert.")}
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.warning("Stock price approaching threshold.")}
          >
            Warning
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast("Stock alert triggered", {
                description: "Samsung Electronics +10%",
                action: {
                  label: "View",
                  onClick: () => {},
                },
              })
            }
          >
            With Action
          </Button>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Progress"
        description="Progress bar for task status"
      >
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </div>
      </ComponentSection>

      <ComponentSection title="Spinner" description="Loading state indicator">
        <div className="flex items-center gap-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <Loader2 className="h-6 w-6 animate-spin" />
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
      </ComponentSection>

      <ComponentSection
        title="Skeleton"
        description="Content loading placeholder"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        </div>
      </ComponentSection>
    </div>
  );
}
