"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout from "../../Layout";
import { IconCheck, IconNotebook, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import {
  clearMessages,
  setError,
  setLoading,
  setSuccess,
  toggleModal,
} from "@/lib/features/messageSlice";
import { ErrorMessages, SuccessMessages } from "@/components/Messages";
import Loader from "@/components/Loader";
import Image from "next/image";

const Page = () => {
  const { selectedUserData } = useSelector((state) => state.user);
  const [userInfo, setUserInfo] = useState({
    name: "",
    userName: "",
    email: "",
    investment: "",
    address: "",
    phoneNo: "",
    totalInvest: "",
    totalProfit: "",
    refBonus: "",
    referralCount: "",
    referralCode: "",
    referredBy: "",
  });

  const { success, error, loading, modalOpen } = useSelector(
    (state) => state.message
  );
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedUserData) {
      setUserInfo({
        name: selectedUserData.fullName ?? "",
        userName: selectedUserData.userName ?? "",
        email: selectedUserData.email ?? "",
        investment: selectedUserData.investment ?? "",
        address: selectedUserData.address ?? "",
        phoneNo: selectedUserData.phoneNo ?? "",
        totalInvest: selectedUserData.totalInvest ?? "",
        totalProfit: selectedUserData.totalProfit ?? "",
        refBonus: selectedUserData.refBonus ?? "",
        referralCount: selectedUserData.referralCount ?? "",
        referralCode: selectedUserData.referralCode ?? "",
        referredBy: selectedUserData.referredBy ?? "",
      });
    }
  }, [selectedUserData]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);

    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { formattedDate, formattedTime };
  };

  const handleDeleteTransaction = async (e) => {
    e.preventDefault();

    let userResponse = confirm("Are you sure you want to delete this user?");
    if (userResponse) {
      dispatch(setLoading(true));
      dispatch(clearMessages());
      try {
        const response = await fetch(
          `/api/admin/users/${selectedUserData._id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!response.ok) {
          dispatch(setError(response.message));
          dispatch(setLoading(false));
          throw new Error("Failed to delete transaction");
        }
        dispatch(setSuccess(response.message));
        dispatch(setLoading(false));
        router.push("/admin/");
      } catch (error) {
        dispatch(setError("An error occurred while deleting transaction."));
        dispatch(setLoading(false));
        console.error("Error deleting transaction:", error);
      }
    } else {
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setLoading(true));
    dispatch(clearMessages());

    try {
      const response = await fetch(
        `/api/admin/users/update/${selectedUserData._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(userInfo),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        dispatch(setError(errorData.message || "Failed to update user"));
        dispatch(setLoading(false));
        throw new Error("Failed to update user");
      } else {
        const result = await response.json();
        dispatch(setSuccess(result.message));
        dispatch(setLoading(false));
        router.push("/admin/");
      }
    } catch (error) {
      dispatch(setError("An error occurred while updating user."));
      dispatch(setLoading(false));
      console.error("Error updating user:", error);
    }
  };

  const handleModalClose = () => {
    dispatch(toggleModal());
  };

  return (
    <Layout>
      {success && modalOpen && (
        <SuccessMessages
          data={success}
          isOpen={handleModalClose}
          status={modalOpen}
        />
      )}
      {error && modalOpen && (
        <ErrorMessages
          data={error}
          isOpen={handleModalClose}
          status={modalOpen}
        />
      )}
      {loading && <Loader />}
      <div className="rounded-xl pb-20 pt-4 px-2 md:px-8 bg-neutral-800 w-full h-full">
        <div className="max-w-xl mx-auto h-full">
          <div className="px-4 md:px-0 rounded-2xl lg:p-6 h-full">
            <h3 className="text-lg font-bold pt-4 pb-10 flex items-center gap-2">
              <IconNotebook className="text-4xl" />
              User Information
            </h3>

            {selectedUserData?._id && (
              <p className="flex justify-between items-center text-sm md:text-md font-bold py-2">
                ID: <span className="font-normal">{selectedUserData._id}</span>
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Full name:
                <input
                  type="text"
                  onChange={handleChange}
                  name="name"
                  value={userInfo.name}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                User name:
                <input
                  type="text"
                  onChange={handleChange}
                  name="userName"
                  value={userInfo.userName}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Email:
                <input
                  type="email"
                  onChange={handleChange}
                  name="email"
                  value={userInfo.email}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Total Investment:
                <input
                  type="number"
                  onChange={handleChange}
                  name="totalInvest"
                  value={userInfo.totalInvest}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Total Profit:
                <input
                  type="number"
                  onChange={handleChange}
                  name="totalProfit"
                  value={userInfo.totalProfit}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Referral Bonus:
                <input
                  type="text"
                  onChange={handleChange}
                  name="refBonus"
                  value={userInfo.refBonus}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Referral Code:
                <input
                  type="text"
                  onChange={handleChange}
                  name="referralCode"
                  value={userInfo.referralCode}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>
              <div className="flex flex-col text-sm md:text-md font-medium py-2">
                Referral Count:
                <input
                  type="text"
                  onChange={handleChange}
                  name="referralCount"
                  value={userInfo.referralCount}
                  className="bg-gray-100 rounded-xl py-2 px-3 mt-2 text-darkColor w-full border-none outline-none"
                />
              </div>

              {selectedUserData?.createdAt && (
                <p className="flex justify-between items-center text-sm md:text-md py-2 font-bold">
                  Time:{" "}
                  <span className="font-normal">
                    {formatDateTime(selectedUserData.createdAt).formattedTime}
                  </span>
                </p>
              )}

              {selectedUserData?.createdAt && (
                <p className="flex justify-between items-center text-sm md:text-md py-2 font-bold">
                  Date:{" "}
                  <span className="font-normal">
                    {formatDateTime(selectedUserData.createdAt).formattedDate}
                  </span>
                </p>
              )}

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleDeleteTransaction}
                  className="flex gap-2 text-xs bg-red-500 p-3 rounded-xl items-center hover:bg-red-700 cursor-pointer duration-150 text-white"
                >
                  <IconTrash className="text-4xl" /> Delete
                </button>
                <button
                  type="submit"
                  className="flex gap-2 text-xs bg-purpleColor p-3 rounded-xl items-center hover:bg-neutral-900 cursor-pointer duration-150 text-white"
                >
                  <IconCheck className="text-4xl" />
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Page;
