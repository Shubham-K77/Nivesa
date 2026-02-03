"use client";
//Tanstack Query
import { useQuery } from "@tanstack/react-query";
import getAllAccounts from "@/queries/account/getAllAccounts.queryOption";
//Hooks
import { useContext, use } from "react";
import { UserContext } from "../../layout";
//Components
import AddTransactionForm from "@/components/custom/AddTransactionForm";
//Type
import { Account } from "@/types/account.type";
import getTransactionInfo from "@/queries/transaction/getTransactionInfo.query";
type PageProps = {
  searchParams: Promise<{ edit?: string }>;
};

const page = ({ searchParams }: PageProps) => {
  //Unwrap searchParams promise
  const params = use(searchParams);
  //Getting LoggedIn User
  const currentUser = useContext(UserContext);
  const { data } = useQuery(getAllAccounts(currentUser?.id || ""));
  const accountsInfo: Account[] = data?.data?.accountInfo;
  const editId = params?.edit;
  // Fetch transaction data if editing (enabled only when editId exists)
  const { data: transactionData } = useQuery({
    ...getTransactionInfo(editId || ""),
    enabled: !!editId,
  });
  const initialData = transactionData?.data?.transactionInfo || null;
  return (
    <div className="w-[95%] lg:w-[75%] min-h-screen bg-transparent flex flex-col justify-start items-center gap-y-12 mt-12 lg:mt-4">
      {/* Motif Display */}
      <div className="w-full bg-transparent rounded-xl mt-12 flex justify-around items-center">
        {/* Text, Description And CTA */}
        <div className="w-full md:w-4/6 lg:w-4/6 flex flex-col p-4 justify-start items-start gap-y-8">
          {/* Hero Text */}
          <div className="text-white font-bold text-5xl md:text-6xl lg:text-5xl text-left">
            {editId
              ? "Edit Existing Transaction Entry"
              : "Record New Transaction Entry"}
          </div>
          {/* Description */}
          <div className="text-gray-400 text-md md:text-lg lg:text-md text-justify md:text-left lg:text-justify">
            Create and manage detailed transactions effortlessly for your
            accounts. Keep track of every income and expense with clear,
            organized records that help you understand your financial flow.
          </div>
        </div>
        {/* Motif */}
        <div
          className="max-sm:hidden md:w-2/6 md:h-[48vh] lg:w-2/6 lg:h-[48vh]"
          style={{
            backgroundImage: `url('/motifs/transaction_bg.svg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
      </div>
      {/* Form Component */}
      <div className="w-full flex flex-col justify-start items-center gap-y-6">
        {/* Form Component */}
        <AddTransactionForm
          accounts={accountsInfo}
          editMode={!!editId}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default page;
