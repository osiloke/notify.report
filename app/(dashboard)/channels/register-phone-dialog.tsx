"use client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import useTimer from "@/lib/hooks/useTimer";
import { cn } from "@/lib/utils";
import { Dialog, Transition } from "@headlessui/react";
import { Link2Icon } from "@radix-ui/react-icons";
import { Title } from "@radix-ui/react-toast";
import { Flex } from "@tremor/react";
import { RefreshCcwIcon, Scan } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const RegisterPhoneDialog = ({ channel }: { id: string; channel: any }) => {
  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [qrCode, setQrCode] = useState<null | {
    qr_link: string;
    qr_duration: number;
  }>(null);

  const [isOpen, setIsOpen] = useState(false);
  const fetchRef = useRef(false);
  const [busy, setBusy] = useState(false);

  const [run, setRun] = useState(false);
  const timerStarted = useRef(false);
  const timer = useTimer({
    duration: qrCode?.qr_duration ?? 0,
    refreshRate: 20,
    loop: false,
    onFinish: () => {
      if (timerStarted.current == true) {
        timerStarted.current = false;
      }
    },
  });

  useEffect(() => {
    if (timerStarted.current == true) return;
    timerStarted.current = true;
    setRun(true);
  }, [qrCode]);

  useEffect(() => {
    if (!run) return;
    setRun(false);
    timer.stop();
    timer.seek(0);
    timer.start();
  }, [run, timer]);

  const timeLeft = (qrCode?.qr_duration ?? 0) - Math.round(timer.time);
  const handleSubmit = async () => {
    if (fetchRef.current) return;
    fetchRef.current = true;
    setBusy(true);
    toast.loading("Creating QR Code");
    const res = await fetch(`/api/v1/channels/${channel.id}/login`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    toast.dismiss();
    fetchRef.current = false;
    setBusy(false);
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
  const isBusy = channel?.status != "running" || busy;
  const canRefresh = qrCode === null || (qrCode && timeLeft == 0);

  return (
    <>
      <Button onClick={openModal} variant="outline" disabled={isBusy}>
        {isBusy ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Link2Icon className="w-4 h-4" />
        )}
        &nbsp;
        <span>Link your whatsapp phone number</span>
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
                    Link whatsapp phone number
                  </Dialog.Title>

                  <>
                    <div className="mt-2 py-5">
                      <div>
                        <Flex
                          className="gap-4 md:flex-row flex-col"
                          justifyContent="center"
                          alignItems="start"
                        >
                          <div className="relative w-full lg:w-96 h-64 lg:h-48">
                            {qrCode && (
                              <img
                                alt="qr code"
                                src={qrCode.qr_link}
                                className="h-64 lg:h-48 w-full rounded-lg object-contain relative"
                              />
                            )}
                            {!qrCode && (
                              <div className="rounded-lg border-gray-100 border-1 h-48 w-full bg-gray-100 justify-center flex items-center">
                                <Scan className="h-32 w-full text-gray-300" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "transition=all h-full inset-y-0 absolute z-10 top-0 left-0 right-0 bottom-0 flex justify-center items-center  rounded-lg",
                                {
                                  "bg-opacity-60 bg-black": canRefresh,
                                }
                              )}
                            >
                              {canRefresh && (
                                <Button
                                  type="button"
                                  disabled={isBusy || timeLeft > 0}
                                  onClick={handleSubmit}
                                >
                                  {isBusy && (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                  )}
                                  Refresh QR Code
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <div>
                              <Title className="font-bold">
                                Scan the QR code from your whatsapp device
                              </Title>
                              <br />
                              <div className="text-sm ml-4">
                                <ul className="list-decimal space-y-4">
                                  <li>
                                    Open WhatsApp on the device with the phone
                                    number you want to link.
                                  </li>
                                  <li>
                                    Go to the app&apos;s settings and tap
                                    <b>&quot;Linked Devices.&quot;</b>
                                  </li>
                                  <li>
                                    Select <b>&quot;Link a Device&quot;</b> and
                                    use your phone&apos;s camera to scan the QR
                                    code on the other device&apos;s screen
                                  </li>
                                </ul>
                              </div>
                              <br />
                              {qrCode && (
                                <span className="text-sm">
                                  Refresh QR Code in{" "}
                                  <b className="text-primary transition-all animate-pulse">
                                    {timeLeft}
                                  </b>{" "}
                                  seconds to avoid link expiration
                                </span>
                              )}
                            </div>
                          </div>
                        </Flex>
                      </div>
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
