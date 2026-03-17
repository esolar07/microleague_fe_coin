import { useState } from "react";
import Header from "@/components/layout/Header";
import CreatorOnboarding from "@/components/creator/CreatorOnboarding";
import CreatorDashboard from "@/components/creator/CreatorDashboard";

const CreatorPage = () => {
  const [isOnboarded, setIsOnboarded] = useState(false);

  return (
    <>
      <Header />
      {isOnboarded ? (
        <CreatorDashboard />
      ) : (
        <CreatorOnboarding onComplete={() => setIsOnboarded(true)} />
      )}
    </>
  );
};

export default CreatorPage;
