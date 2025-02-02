"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import Loader from "@/components/Loader";
import Layout from "./Layout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { setSelectedUser, setUserData } from "@/lib/features/userSlice";
import { IconUser } from "@tabler/icons-react";
import { clearMessages, setError, setLoading } from "@/lib/features/messageSlice";

// Fetcher function for useSWR
const fetcher = async (url) => {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
};

const Page = () => {
  // Fetch all users using useSWR
  const { data, error, isLoading } = useSWR("/api/admin/users/", fetcher);

  // Redux state and dispatch
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Number of users per page

  // Update Redux state when data is fetched
  useEffect(() => {
    if (error) {
      console.error("Error fetching users:", error);
      if (error.status === 401) {
        router.push("/login"); // Redirect to login if unauthorized
      }
    } else if (data && data.users) {
      console.log("Fetched users:", data.users); // Debugging
      dispatch(setUserData(data.users)); // Update Redux state with fetched users
    }
  }, [data, error, dispatch, router]);

  // Show loader while data is being fetched
  if (isLoading) {
    return <Loader />;
  }

  // Ensure userData is an array
  const users = Array.isArray(userData) ? userData : [];

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleUserClick = (user) => {
    console.log(user);

    dispatch(setLoading(true));
    dispatch(clearMessages());

    if (!user) {
      dispatch(setError("No user information"));
      dispatch(setLoading(false));
    } else {
      console.log("dispatched");

      dispatch(setSelectedUser(user));
      dispatch(setLoading(false));
      router.push("/admin/users/details");
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

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

  return (
    <div className="w-full lg:h-[100vh] flex flex-1">
      <Layout>
        <div className="rounded-xl pb-10 pt-2 px-4 md:px-8 bg-neutral-800 w-full">
          <p className="font-bold md:text-lg py-4">Users</p>

          {/* Total Users Count */}
          <div className="grid gap-4">
            <div className="bg-purpleColor rounded-xl px-4 py-6">
              <h3 className="text-2xl font-bold">{users.length || 0}</h3>
              <p className="text-xs md:text-sm font-medium">Total Users</p>
            </div>
          </div>

          {/* List of Users */}
          <div className="rounded-xl pb-8 lg:px-8 bg-neutral-800 w-full h-full mt-4">
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => {
                const { formattedDate, formattedTime } = formatDateTime(
                  user.createdAt
                );

                return (
                  <div
                    key={user._id}
                    className="mt-10 flex gap-4 items-center w-full cursor-pointer hover:scale-95 duration-200"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="w-fit">
                      {/* Display user avatar or placeholder */}
                      <span className="w-[3rem] h-[3rem] bg-orange-300 rounded-full flex justify-center items-center">
                        <IconUser className="text-4xl" />
                      </span>
                    </div>
                    <div className="flex items-end justify-center w-full lg:gap-10">
                      <div className="grid lg:grid-cols-5 w-full">
                        <h2 className="text-sm font-bold col-span-1 w-full">{user.userName}</h2>
                        <p className="text-xs text-gray-300 col-span-1 w-full">{user.email}</p>
                        <p className="text-xs text-gray-300 col-span-1 w-full hidden lg:block">
                          {user.investment}
                        </p>
                        <p className="text-xs text-gray-300 col-span-1 w-full hidden lg:block">
                          {user.referralCode}
                        </p>
                        <p className="text-xs text-gray-300 col-span-1 w-full hidden lg:block font-semibold">
                          referredBy: {user.referredBy !== null ? user.referredBy : "None"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 w-fit items-end">
                        <h2 className="text-sm font-bold">
                          {user.totalInvest}
                        </h2>
                        <p className="text-xs text-gray-300 whitespace-nowrap">
                          {formattedDate}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No users found.</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-xs bg-purpleColor rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Page {currentPage} of {Math.ceil(users.length / usersPerPage)}
            </span>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === Math.ceil(users.length / usersPerPage)}
              className="px-4 py-2 text-xs bg-purpleColor rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Page;