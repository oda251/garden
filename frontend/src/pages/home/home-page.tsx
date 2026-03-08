import { Button } from "~/src/shared/ui/index";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Garden</h1>
      <Button variant="default">はじめる</Button>
    </div>
  );
}
