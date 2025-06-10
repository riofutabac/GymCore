import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold">GymCore</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
