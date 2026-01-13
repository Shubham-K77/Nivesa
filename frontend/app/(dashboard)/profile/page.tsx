"use client";
import { updateProfile } from "@/actions/users.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LoaderIcon,
  Lock,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { userInfo, UserData } from "@/types/user.type";
import { useQuery } from "@tanstack/react-query";
import getActiveUser from "@/queries/user/getCurrentUser.queryOption";
import { useUpdateUser } from "@/queries/user/editUserInfo.mutation";
const ProfilePage = () => {
  //Get Current User
  const { data, isLoading } = useQuery(getActiveUser());
  const userInfo: userInfo = data?.data?.currentUser;
  const updateUserMutation = useUpdateUser();
  //Use State Variables
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [name, setName] = useState(userInfo?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassowrd, setConfirmNewPassword] = useState("");
  //Update Name, Picture, Contact At Initial Mount
  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setPhoneNumber(userInfo.phoneNumber || "");
    }
    //If User Tries To Change The Picture
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [userInfo, previewUrl]);
  //Handle File Change
  const handleFileChange = (fileSelected: File) => {
    if (fileSelected) {
      const url = URL.createObjectURL(fileSelected);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };
  //Handle The Changes
  const handleChange = async () => {
    if (currentPassword || newPassword || confirmNewPassowrd) {
      if (!currentPassword || !newPassword || !confirmNewPassowrd) {
        return toast.error("Please fill all password fields");
      }
      if (newPassword !== confirmNewPassowrd) {
        return toast.error("Passwords do not match");
      }
      //Check If Password Matches The Regex
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return toast.error(
          "Please ensure your password meets all the requirements listed."
        );
      }
    }
    //Then add all the info
    const userData: UserData = {
      name,
      phoneNumber,
      profilePic,
      ...(currentPassword && { password: currentPassword, newPassword }),
    };
    //Call The Function
    updateUserMutation.mutate(userData, {
      onSuccess: (response) => {
        toast.success(
          response?.data?.message || "Profile updated successfully"
        );
        setProfilePic(null);
        setPreviewUrl(null);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      },
      onError: (error: any) => {
        console.error(error);
        toast.error(
          error?.response?.data?.message || "Failed to update profile"
        );
      },
    });
  };
  //Discard The Changes
  const discardChange = () => {
    setProfilePic(null);
    setPreviewUrl(null);
    setName(userInfo?.name || "");
    setPhoneNumber(userInfo?.phoneNumber || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-8 mt-12 lg:mt-4">
      {/* Motif Display */}
      <div className="w-full bg-transparent rounded-xl mt-12 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-full md:w-4/6 lg:w-4/6 flex flex-col p-4 justify-start items-start gap-y-8">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl md:text-6xl lg:text-5xl text-left">
            Personalize Your Experience
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md md:text-lg lg:text-md text-justify md:text-left lg:text-justify">
            Update your personal information, preferences, and account details.
            Make sure everything is accurate to get the most out of Nivesa.
          </div>
        </div>
        {/* Motif */}
        <div
          className="max-sm:hidden md:w-2/6 md:h-[48vh] lg:w-2/6 lg:h-[56vh]"
          style={{
            backgroundImage: `url('/motifs/myProfile.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      {/* Basic Information Edit */}
      {isLoading !== true ? (
        <div className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 flex flex-col justify-start items-start p-8 gap-y-6">
          {/* Title And Description */}
          <div className="flex flex-col justify-start items-start gap-y-2">
            {/* Title */}
            <div className="text-md font-semibold text-white">
              Profile Information
            </div>
            {/* Description */}
            <div className="text-sm text-muted-foreground">
              Update your photo and personal details.
            </div>
          </div>
          {/* Profile Picture Section */}
          <div className="w-full flex justify-start items-center gap-x-4">
            {/* Profile Pic */}
            {previewUrl ? (
              <div
                className="w-20 h-18 lg:w-24 lg:h-24 rounded-full"
                style={{
                  backgroundImage: `url(${previewUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
            ) : userInfo?.imageUrl ? (
              <div
                className="w-20 h-18 lg:w-24 lg:h-24 rounded-full"
                style={{
                  backgroundImage: `url(${userInfo?.imageUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              ></div>
            ) : (
              <div className="w-20 h-18 lg:w-24 lg:h-24 rounded-full bg-linear-to-br from-green-400/80 via-teal-400/80 to-emerald-400/80 flex justify-center items-center text-white text-xl font-semibold">
                {userInfo?.name.split(" ")[0]?.charAt(0).toUpperCase()}
                {userInfo?.name.split(" ")[1]?.charAt(0).toUpperCase()}
              </div>
            )}
            {/* CTA And Info */}
            <div className="flex flex-col justify-start items-start gap-y-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600/80 text-center text-white hover:cursor-pointer hover:bg-blue-500/80">
                    Upload New
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/75 text-white">
                  <DialogHeader>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                    <DialogDescription>
                      Add a profile picture to make your account more personal.
                      Supported formats: JPG, PNG, GIF.
                    </DialogDescription>
                  </DialogHeader>
                  {/* Picture Form */}
                  <div className="w-[95%] flex justify-start items-center">
                    <Input
                      className="w-full text-white bg-white/10 hover:cursor-pointer"
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={(e) =>
                        setProfilePic(e.target.files?.[0] || null)
                      }
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="destructive"
                        className="hover:cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        className="bg-green-400/80 text-white hover:cursor-pointer hover:bg-green-500/80"
                        onClick={() =>
                          profilePic && handleFileChange(profilePic)
                        }
                      >
                        Select Picture
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* Info */}
              <div className="text-sm text-muted-foreground">
                JPG, GIF or PNG. Max size of 2MB.
              </div>
            </div>
          </div>
          {/* Personal Info Section */}
          <div className="w-full border-t-2 border-white/10 p-8">
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  Full Name
                </div>
                <div className="w-full relative">
                  <Input
                    className="w-full bg-white/5 border border-white/10 pl-8 text-white"
                    value={name}
                    placeholder="John Doe"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
                </div>
              </div>
              {/* Phone Number */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  Phone Number
                </div>
                <div className="w-full relative">
                  <Input
                    className="w-full bg-white/5 border border-white/10 pl-8 text-white"
                    value={phoneNumber}
                    placeholder="+9779801234567"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <Phone className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
                </div>
              </div>
              {/* Email */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  Email
                </div>
                <div className="w-full relative">
                  <Input
                    className="w-full bg-white/5 border border-white/10 pl-8 text-white"
                    type="email"
                    value={userInfo?.email}
                    placeholder="john.doe@example.com"
                    disabled
                  />
                  <Mail className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Email cannot be changed manually. Please contact support.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Skeleton className="w-full h-[40vh] rounded-lg bg-white/2 border border-white/10" />
        </>
      )}
      {/* Password Change Edit */}
      {isLoading !== true ? (
        <div className="w-full rounded-lg bg-[#0A0A0A] border border-white/10 flex flex-col justify-start items-start p-8 gap-y-6 mb-4">
          {/* Title And Description */}
          <div className="flex flex-col justify-start items-start gap-y-2">
            {/* Title */}
            <div className="text-md font-semibold text-white flex justify-start items-center gap-x-2">
              <Shield className="w-6 h-6 font-semibold text-amber-400/80" />{" "}
              Security
            </div>
            {/* Description */}
            <div className="text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </div>
          </div>
          {/* Input Fields */}
          <div className="w-full grid grid-cols-1 gap-4">
            {/* Current Password */}
            <div className="w-full flex flex-col justify-start items-start gap-y-2">
              <div className="text-sm font-semibold text-muted-foreground">
                Current Password
              </div>
              <div className="w-full relative">
                <Input
                  className="w-full bg-white/5 border border-white/10 pl-8 text-white font-bold text-md"
                  type="password"
                  placeholder="............"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Lock className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
              </div>
            </div>
            {/* New Password & New Confirm Password */}
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  New Password
                </div>
                <div className="w-full relative">
                  <Input
                    className="w-full bg-white/5 border border-white/10 pl-8 text-white"
                    placeholder="............"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Lock className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
                </div>
              </div>
              {/* Confirm New Password */}
              <div className="w-full flex flex-col justify-start items-start gap-y-2">
                <div className="text-sm font-semibold text-muted-foreground">
                  Confirm New Password
                </div>
                <div className="w-full relative">
                  <Input
                    className="w-full bg-white/5 border border-white/10 pl-8 text-white"
                    placeholder="............"
                    value={confirmNewPassowrd}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                  <Lock className="w-4 h-4 absolute top-2.5 left-2 text-muted-foreground" />
                </div>
              </div>
            </div>
            {/* Requirements Info */}
            <div className="w-full p-8 bg-amber-800/20 rounded-md border border-amber-800/80 flex flex-col justify-start item-start">
              {/* Title */}
              <div className="text-sm font-semibold text-orange-400/80">
                Password Requirements:
              </div>
              <ul className="list-disc pl-4">
                <li className="text-sm text-muted-foreground">
                  Must be at least 8 characters long.
                </li>
                <li className="text-sm text-muted-foreground">
                  Must contain at least one uppercase letter (A-Z).
                </li>
                <li className="text-sm text-muted-foreground">
                  Must contain at least one lowercase letter (a-z).
                </li>
                <li className="text-sm text-muted-foreground">
                  Must contain at least one number (0-9).
                </li>
                <li className="text-sm text-muted-foreground">
                  Must contain at least one special character (e.g., !@#$%^&*).
                </li>
                <li className="text-sm text-muted-foreground">
                  Cannot be empty.
                </li>
                <li className="text-sm text-muted-foreground">
                  Must provide the current password to initiate the change.
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Skeleton className="w-full h-[40vh] rounded-lg bg-white/2 border border-white/10" />
        </>
      )}
      {/* For Save Changes CTA */}
      {Boolean(
        profilePic ||
          previewUrl ||
          (name && name !== userInfo?.name) ||
          (phoneNumber && phoneNumber !== userInfo?.phoneNumber) ||
          currentPassword ||
          newPassword ||
          confirmNewPassowrd
      ) && (
        <div className="w-full mb-4 flex justify-center lg:justify-start items-center gap-x-6">
          {/* Save Changes */}
          <Button
            className="flex h-[7.5vh] justify-center items-center gap-x-2 bg-green-500/80 text-white hover:cursor-pointer hover:bg-green-400/80 p-2"
            onClick={handleChange}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? (
              <>
                Saving Changes
                <LoaderIcon className="text-white w-4 h-4 animate-spin" />
              </>
            ) : (
              <>
                <Save className="w-3 h-3 text-white" />
                Save Changes
              </>
            )}
          </Button>
          {/* Discard Changes */}
          <Button
            className="flex h-[7.5vh] justify-center items-center gap-x-2 bg-red-500/80 text-white hover:cursor-pointer hover:bg-red-400/80 p-2"
            onClick={discardChange}
            disabled={updateUserMutation.isPending}
          >
            <X className="w-3 h-3 text-white" />
            Discard Changes
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
