import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { CreateWizard } from "./wizard";

export const metadata: Metadata = { title: "Neue Tipprunde" };

export default function NewPoolPage() {
  return (
    <div className="bg-dots flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-xl px-4 py-5">
        <Logo />
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-16">
        <CreateWizard />
      </main>
    </div>
  );
}
