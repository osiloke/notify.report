"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { Title } from "@radix-ui/react-toast";
import { Card, Flex } from "@tremor/react";
import { QrCode, Scan, TrashIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const RegisterPhoneDialog = ({ id }: { id: string }) => {
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const getQRQueryRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const [qrCode, setQrCode] = useState<null | {
    qr_link: string;
    qr_duration: number;
  }>(null);

  const handleSubmit = async () => {
    if (getQRQueryRef.current) return;
    getQRQueryRef.current = true;
    toast.loading("Creating QR Code");
    const res = await fetch(`/api/v1/channels/${id}/login`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    toast.dismiss();
    getQRQueryRef.current = false;
    if (res.status != 200) {
      const json = await res.json();
      try {
        if (json.error === "LOGGED_IN") {
          toast.error("You are already logged in");
          mutate("/api/v1/channels");
          setIsOpen(false);
        } else {
          toast.error("Failed generating QR Code. Please try again");
        }
      } catch (error) {
        toast.error("Failed generating QR Code. Please try again");
      }
    } else {
      const json = await res.json();
      toast.success("QR created successfully!");
      setQrCode(json.results);
      // setIsOpen(false);
    }
  };

  return (
    <>
      <Button onClick={openModal} variant="outline">
        <Icons.whatsapp className="w-4 h-4" /> <span>Register phone</span>
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
                    Register phone
                  </Dialog.Title>

                  <>
                    <div className="mt-2 py-5">
                      <div>
                        <Flex
                          className="gap-4 md:flex-row flex-col"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {!qrCode && (
                            <div className="rounded-lg border-gray-100 border-1 h-48 w-96 bg-gray-100 justify-center flex items-center">
                              <Scan className="h-32 w-32 text-gray-300" />
                            </div>
                          )}
                          {qrCode && (
                            <img
                              alt="qr code"
                              src={qrCode.qr_link}
                              className="h-48 w-96 rounded-lg object-contain "
                            />
                          )}
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div>
                              <Title className="font-bold">
                                Scan the QR code from your whatsapp device
                              </Title>
                              <br />
                              <span className="text-sm">
                                Open Setting {">"} Linked Devices {">"} Link
                                Device
                              </span>
                              <br />
                              {qrCode && (
                                <span className="text-sm">
                                  Refresh QR Code in {qrCode?.qr_duration}{" "}
                                  seconds to avoid link expiration
                                </span>
                              )}
                            </div>
                          </div>
                        </Flex>
                      </div>
                    </div>

                    <div className="mt-4 space-x-2 flex justify-between">
                      <Button
                        type="button"
                        disabled={getQRQueryRef.current}
                        onClick={handleSubmit}
                      >
                        {getQRQueryRef.current == true && (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Refresh QR Code
                      </Button>
                      <button
                        className="
                        bg-gray-100 text-gray-500 hover:text-gray-600
                        inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none"
                        onClick={closeModal}
                      >
                        Cancel
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

export default RegisterPhoneDialog;
