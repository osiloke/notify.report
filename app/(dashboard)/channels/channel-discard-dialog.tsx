"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Dialog, Transition } from "@headlessui/react";
import { StopIcon } from "@radix-ui/react-icons";
import { StopCircle, TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { Fragment, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const ChannelStopDialog = ({
  channel,
}: {
  channel: {
    id?: string;
    status?: string;
    name?: string;
  };
}) => {
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const fetchRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setBusy(true);
    const resp = await fetch(`/api/v1/channels/${channel.id}/discard`, {
      method: "GET",
    });
    if (!resp.ok) {
      setBusy(false);
      fetchRef.current = false;
    }
    mutate("/api/v1/channels");
    setIsOpen(false);
  };
  const isBusy =
    (channel.status ?? "") in ["stoping", "stopping"] ||
    fetchRef.current === true;

  return (
    <>
      <Button
        disabled={isBusy}
        onClick={openModal}
        variant="outline"
        className="py-2 leading-none px-3 font-medium text-red-600 hover:text-red-500 duration-150 hover:bg-gray-50 rounded-lg"
      >
        {isBusy ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <StopCircle className="w-4 h-4" />
        )}
        &nbsp; Stop
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Stop manager
                  </Dialog.Title>

                  <>
                    <div className="mt-2">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium  mb-1 text-red-600"
                      >
                        Stopping a manager does not unlink your phone number.
                      </label>
                      <br />
                      <label>Are you sure you want to stop this manager?</label>
                      <input
                        type="text"
                        name="name"
                        value={channel.name}
                        disabled
                        placeholder="Whatapp manager"
                        className="w-full px-2 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                      />
                    </div>

                    <div className="mt-4 space-x-2 flex justify-end">
                      <button
                        className="
                        bg-gray-100 text-gray-500 hover:text-gray-600
                        inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isBusy}
                        type="button"
                        className="text-white bg-red-400 hover:bg-red-500  inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none "
                        onClick={handleSubmit}
                      >
                        {isBusy && (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Stop
                      </button>
                    </div>
                  </>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ChannelStopDialog;
