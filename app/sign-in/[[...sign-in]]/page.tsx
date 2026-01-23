"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-zinc-50 font-serif dark:bg-black py-16 px-8">
      <div className="mx-auto flex w-full max-w-lg justify-center">
        <SignIn />
      </div>
    </div>
  );
}
