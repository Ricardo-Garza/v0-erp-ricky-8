"use client"

import BenefitsSection from "@/components/landing/BenefitsSection"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import Header from "@/components/landing/Header"
import HeroSection from "@/components/landing/HeroSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import ModulesSection from "@/components/landing/ModulesSection"
import PainPointsSection from "@/components/landing/PainPointsSection"
import SolutionSection from "@/components/landing/SolutionSection"
import WhatsAppButton from "@/components/landing/WhatsAppButton"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <PainPointsSection />
        <SolutionSection />
        <ModulesSection />
        <BenefitsSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
