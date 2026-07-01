import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { StatsBar } from "./components/StatsBar";
import { PoolsGrid } from "./components/PoolsGrid";
import { Actions } from "./components/Actions";
import { Footer } from "./components/Footer";
import { WalletNotice } from "./components/WalletNotice";
import { useProtocol } from "./hooks/useDepGuard";
import { CONTRACT_ADDRESS } from "./lib/genlayer";

export function App() {
  const { stats, pools, loading, refresh } = useProtocol();

  return (
    <div className="min-h-screen">
      <Header />
      <WalletNotice />

      {!CONTRACT_ADDRESS && (
        <div className="mx-auto max-w-[1800px] px-6 md:px-10 lg:px-16 pt-4">
          <div
            className="border-2 border-dashed border-accent bg-white p-3 text-center text-base text-accent"
            style={{ borderRadius: "18px 8px 22px 8px / 8px 22px 8px 20px" }}
          >
            VITE_CONTRACT_ADDRESS is not set -- reads/writes are disabled.
          </div>
        </div>
      )}

      <Hero />
      <HowItWorks />
      <StatsBar stats={stats} loading={loading} />
      <Actions onChanged={refresh} />
      <PoolsGrid pools={pools} loading={loading} onRefresh={refresh} />
      <Footer />
    </div>
  );
}
