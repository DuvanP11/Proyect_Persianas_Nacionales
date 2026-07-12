import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { Categories } from "@/components/home/Categories";
import { WhyUs } from "@/components/home/WhyUs";
import { Process } from "@/components/home/Process";
import { About } from "@/components/home/About";
import { SocialProof } from "@/components/home/SocialProof";
import { FinalCTA } from "@/components/home/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Categories />
      <WhyUs />
      <Process />
      <About />
      <SocialProof />
      <FinalCTA />
    </>
  );
}
