import { useQuery } from "convex/react";
import { Toaster } from "sonner";
import { api } from "../convex/_generated/api";
import { TaskCalendar } from "./components/TaskCalendar";
import { SignOutButton } from "./SignOutButton";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shadow-sm bg-white/80 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-primary">Task Calendar</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <TaskCalendar />
    </div>
  );
}
