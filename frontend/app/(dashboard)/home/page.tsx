const page = () => {
  return (
    <div className="w-full min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-6">
      {/* Motif Display */}
      <div className="w-[75%] h-[40vh] bg-transparent rounded-xl mt-8 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-4/6 flex flex-col p-4 justify-start items-start gap-y-4">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl text-left">
            Your Personal Finance Companion
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md text-justify">
            Get a complete view of your spending, budgets, and goals all in one
            place. Nivesa helps you stay organized and in control of your
            financial life.
          </div>
          {/* CTA Button */}
          <div className="w-[35%] h-[8vh] rounded-md bg-amber-400/80 flex justify-center items-center transition-all ease-in-out duration-150 hover:scale-105 hover:cursor-pointer hover:bg-yellow-400/80">
            <div className="text-white font-semibold text-md">
              Create Transaction
            </div>
          </div>
        </div>
        {/* Motif */}
        <div
          className="w-2/6 h-[38vh]"
          style={{
            backgroundImage: `url('/motifs/dashboard.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
    </div>
  );
};

export default page;
