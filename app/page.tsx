"use client";

import Privy, { LocalStorage } from "@privy-io/js-sdk-core";
import { useFundWallet, usePrivy } from "@privy-io/react-auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const searchParams = useSearchParams();
  const signature = searchParams.get("signature");
  const message = searchParams.get("message");
  const address = searchParams.get("address");
  const { fundWallet } = useFundWallet();

  const privy = new Privy({
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    storage: new LocalStorage(),
  });

  const { authenticated, user } = usePrivy();

  useEffect(() => {
    const signInUsingParams = async () => {
      if (!signature || !message || !address) return;
      await privy.auth.siwe.loginWithSiwe(
        signature as string,
        {
          address: address as string,
          chainId: `eip155:8453`,
        },
        message as string
      );
      // This redirect will trigger react-auth to automatically load the user state
      // window.location.href = window.location.origin + "/";
    };
    signInUsingParams();
  }, [signature, address, message, privy.auth.siwe]);

  useEffect(() => {
    if (authenticated && user && address) {
      fundWallet(
        user?.customMetadata?.smartAccountAddress?.toString() ||
          user?.wallet?.address ||
          address!
      );
    }
  }, [authenticated, user, address]);

  return (
    <>
      {!authenticated && (
        <p className="text-black">Loading... don&apos;t close this page.</p>
      )}
      {authenticated && user && address && (
        <p className="text-black">Opening on-ramp...</p>
      )}
    </>
  );
}
