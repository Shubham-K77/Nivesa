import { Button } from "../ui/button";

const Navbar = () => {
  return (
    <div className="w-[75%] h-[11.5vh] rounded-2xl bg-black/40 lg:backdrop-blur-lg fixed top-4 flex justify-around items-center border-2 border-gray-800/80 z-5">
      {/* Logo and title */}
      <div className="w-[35%] flex justify-start md:justify-center lg:justify-start items-center gap-x-2 md:gap-x-3 lg:gap-x-4">
        {/* Logo */}
        <div
          className="w-[34%] md:w-[20%] lg:w-[16.25%] h-[22.5vh] md:h-[16vh] lg:h-[8.25vh] bg-transparent"
          style={{
            backgroundImage: `url(/images/logo.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* Title */}
        <div className="font-bold text-4xl md:text-3xl lg:text-3xl text-yellow-400/80">
          Nivēśa
        </div>
      </div>
      {/* Buttons Around */}
      <div className="w-[60%] flex justify-evenly items-center gap-x-2">
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          Features
        </div>
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          How it Works
        </div>
        <div className="text-md text-white hover:cursor-pointer hover:text-yellow-400/80">
          Pricing
        </div>
        {/* CTA Buttons */}
        <Button className="bg-transparent border border-yellow-300/80 text-center text-yellow-400/80 w-[18%] h-[6.5vh] text-md hover:cursor-pointer hover:bg-yellow-400/40 hover:text-white">
          Sign In
        </Button>
        <Button className="bg-yellow-500/80 text-center text-white w-[20%] h-[6.5vh] text-md hover:cursor-pointer hover:bg-yellow-600/80">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
