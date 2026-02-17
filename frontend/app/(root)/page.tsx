/* eslint-disable react/no-unescaped-entities */
// ShadCn Components
import DisplayCard from "@/components/custom/DisplayCard";
import HowItWorksCard from "@/components/custom/HowItWorksCard";
import SubscriptionCard from "@/components/custom/SubscriptionCard";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
//Icons:
import { FaArrowRight } from "react-icons/fa";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-start items-center">
      {/* Hero Section     */}
      <BackgroundBeamsWithCollision className="relative z-0 mt-12">
        <div className="w-full min-h-screen flex flex-col justify-center items-center bg-transparent gap-y-4 md:gap-y-6 relative z-10 px-4 py-20">
          {/* Tagline */}
          <div className="w-full max-w-sm md:max-w-md lg:max-w-xs rounded-2xl bg-linear-to-r from-amber-500/50 to-yellow-500/50 backdrop-blur-md border border-amber-400/40 flex justify-center items-center p-3 md:p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-xs md:text-base lg:text-sm font-semibold text-yellow-50 text-center">
              🧠 Powered by AI & Machine Learning
            </div>
          </div>
          {/* Hero Text */}
          <div className="w-full max-w-4xl flex flex-col justify-center items-center gap-y-2 md:gap-y-3">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-center leading-tight">
              Master Your Daily Finances
            </h1>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center leading-tight">
              <span className="text-white">with </span>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-amber-500">
                Nivēśa
              </span>
            </h2>
          </div>
          {/* Description */}
          <div className="w-full max-w-3xl flex justify-center items-center">
            <p className="text-base md:text-xl lg:text-lg text-gray-200/90 text-center leading-relaxed px-4">
              Predict your spending before it happens with our intelligent AI.
              Get personalized insights, prevent budget overruns, and achieve
              financial freedom. Nivēśa means "investment" in Nepali – and we'll
              help you invest in your financial future.
            </p>
          </div>
          {/* CTA */}
          <button className="mt-4 px-8 py-4 md:px-10 md:py-5 rounded-xl bg-linear-to-r from-yellow-400 to-amber-500 text-lg md:text-xl font-bold text-white shadow-lg hover:shadow-yellow-500/50 hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-yellow-300/30">
            Take Control Now!
          </button>
        </div>
      </BackgroundBeamsWithCollision>
      {/* Features Section */}
      <div
        id="features"
        className="w-full min-h-screen flex flex-col justify-center items-center text-center relative py-16 md:py-24 bg-linear-to-b from-black/95 via-gray-900/90 to-black/95 px-4 scroll-mt-20"
      >
        {/* Title Section */}
        <div className="mb-12 md:mb-16">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 px-4 md:px-8">
              Why Choose Nivēśa?
            </h2>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#F59E0B"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-300/80 mt-6 md:mt-8 text-base md:text-lg p-2 max-w-3xl mx-auto leading-relaxed">
            Our intelligent platform provides comprehensive financial management
            tailored to your income and spending needs.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-2">
          <DisplayCard
            icon={1}
            title={"Predictive Spending Analytics"}
            desc={
              "Track expenses with AI that learns your patterns and predicts future spending before it happens."
            }
          />
          <DisplayCard
            icon={2}
            title={"Personalized Financial Insights"}
            desc={
              "Get detailed analysis of your spending habits, budget health, and actionable recommendations for improvement."
            }
          />
          <DisplayCard
            icon={3}
            title={"Smart Budget Alerts"}
            desc={
              "Receive proactive warnings about potential overspending before you run out of money each month."
            }
          />
          <DisplayCard
            icon={4}
            title={"AI Receipt Scanning"}
            desc={
              "Snap photos of receipts and let AI automatically extract, categorize, and log your expenses instantly."
            }
          />
          <DisplayCard
            icon={5}
            title={"Progress Dashboard"}
            desc={
              "Monitor your financial growth over time with visual charts, trends, and monthly performance reports."
            }
          />
          <DisplayCard
            icon={6}
            title={"WhatsApp Integration"}
            desc={
              "Stay informed anywhere, anytime. Get real-time spending alerts and updates on your preferred platform."
            }
          />
        </div>
      </div>
      {/* How it Works? Section */}
      <div
        id="how-it-works"
        className="w-full min-h-screen bg-linear-to-b from-black/95 to-gray-900/90 flex flex-col justify-center items-center text-center relative py-16 md:py-24 gap-y-6 md:gap-y-8 px-4 scroll-mt-20"
      >
        {/* Title Section */}
        <div className="mb-8 md:mb-12">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 px-4 md:px-8">
              How Nivēśa Works?
            </h2>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#F59E0B"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-300/80 mt-6 md:mt-8 text-base md:text-lg p-2 max-w-3xl mx-auto leading-relaxed">
            Get started in minutes and begin managing your finances smarter with
            our streamlined onboarding process.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-2">
          <HowItWorksCard
            value={1}
            title={"Set Your Financial Profile"}
            desc={
              "Share your income, expenses, and goals for personalized budget recommendations tailored to your lifestyle."
            }
          />
          <HowItWorksCard
            value={2}
            title={"Track with AI Intelligence"}
            desc={
              "Log transactions with AI-powered predictions that learn your patterns and forecast future spending."
            }
          />
          <HowItWorksCard
            value={3}
            title={"Get Insights & Prosper"}
            desc={
              "Receive smart alerts and monitor your progress with personalized recommendations and visual analytics."
            }
          />
        </div>
      </div>
      {/* Pricing Section */}
      <div
        id="pricing"
        className="w-full min-h-screen bg-linear-to-b from-gray-900/90 via-black/90 to-black/95 flex flex-col justify-center items-center text-center relative py-16 md:py-24 gap-y-6 md:gap-y-8 px-4 scroll-mt-20"
      >
        {/* Title Section */}
        <div className="mb-8 md:mb-12">
          {/* Title And Description */}
          <div className="relative inline-block">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 px-4 md:px-8">
              Simple, Transparent Pricing
            </h2>

            {/* Curve under heading only */}
            <svg
              className="absolute left-0 right-0 -bottom-2"
              width="100%"
              height="12"
              viewBox="0 0 1000 12"
              preserveAspectRatio="none"
            >
              <path
                d="M10 8 Q 500 2, 990 8"
                stroke="#F59E0B"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {/* Description */}
          <p className="text-gray-300/80 mt-6 md:mt-8 text-base md:text-lg p-2 max-w-3xl mx-auto leading-relaxed">
            Choose the plan that fits your needs. All plans include core
            features to help you master your finances.
          </p>
        </div>
        {/* Cards Section */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-2">
          <SubscriptionCard
            type={"Free"}
            desc={"Great for trying out smart budgeting"}
            price={"RS 0"}
            subprice={"forever"}
            points={[
              "Track up to 50 transactions per month",
              "Basic expense categorization",
              "Simple budget creation",
              "Monthly spending summary",
              "Manual transaction entry",
              "Basic dashboard view",
            ]}
          />
          <SubscriptionCard
            type={"Student"}
            desc={"Ideal for students and budget-conscious individuals"}
            price={"RS 149"}
            subprice={"per month"}
            points={[
              "Unlimited transaction tracking",
              "AI-powered spending predictions",
              "Smart budget alerts via WhatsApp",
              "AI receipt scanning (OCR)",
              "Multi-account management",
              "Visual spending analytics",
              "Monthly financial insights report",
              "Progress tracking dashboard",
            ]}
          />
          <SubscriptionCard
            type={"Pro"}
            desc={"Designed for ambitious savers and professionals"}
            price={"RS 249"}
            subprice={"per month"}
            points={[
              "Everything in Student",
              "Advanced predictive analytics (75-85% accuracy)",
              "Seasonal trend analysis",
              "Recurring transaction detection",
              "Priority WhatsApp alerts",
              "Automated monthly reports with AI insights",
              "Budget goal recommendations",
              "Export data & detailed reports",
              "Premium customer support",
            ]}
          />
        </div>
      </div>
      {/* Banner */}
      <div className="w-full px-4 sm:px-6 md:px-12 py-16 md:py-24 bg-linear-to-b from-black/95 to-gray-900/90">
        <div className="max-w-7xl mx-auto bg-linear-to-br from-yellow-500 via-amber-500 to-orange-600 p-8 sm:p-10 md:p-16 text-center shadow-2xl rounded-3xl backdrop-blur-sm border border-yellow-400/50">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-white/90 text-base sm:text-lg md:text-xl mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed">
            Join many smart students who have transformed their spending habits
            with Nivēśa. Start your journey with us and invest in your financial
            future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
            <button className="w-full sm:w-auto bg-white text-amber-600 font-bold px-8 md:px-10 py-4 md:py-4 text-lg md:text-xl rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
              Start Today
              <FaArrowRight className="text-base" />
            </button>
            <button className="w-full sm:w-auto border-2 border-white/70 text-white font-bold px-8 md:px-10 py-4 md:py-4 text-lg md:text-xl rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
