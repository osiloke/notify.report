"use client";

import { Instance } from "@/lib/types";
import { Dialog, Transition } from "@headlessui/react";
import { Button, Callout, Card, Metric, Text } from "@tremor/react";
import { CheckCircleIcon } from "lucide-react";
import { Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import { mutate } from "swr";

const ChannelDialog = ({ channels }: { channels: Instance[] }) => {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);

    setTimeout(() => {
      setName("");
      setInstance(undefined);
    }, 500);
  }

  function openModal() {
    setIsOpen(true);
  }

  const [name, setName] = useState<string>();
  const [instance, setInstance] = useState<Instance | undefined>();

  const handleSubmit = async () => {
    const res = await fetch("/api/v1/channels", {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();

    toast.success("Manager created successfully!");

    setInstance(json.instance);
    mutate("/api/v1/channels");
    // closeModal();
  };

  const handleChange = (e: any) => {
    setName(e.target.value);
  };

  return (
    <>
      {channels?.length == 0 && (
        <Button type="button" onClick={openModal}>
          Create a manager
        </Button>
      )}

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
                    {!instance ? "Create a manager" : "Your instance"}
                  </Dialog.Title>

                  {!instance ? (
                    <>
                      <div className="mt-2">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={handleChange}
                          placeholder="Main business account"
                          className="w-full px-2 py-2 text-gray-500 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg"
                        />
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={handleSubmit}
                        >
                          Create
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-2">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          You have created a new whatsapp manager
                        </label>
                        <div className="flex items-center">
                          <Card className="max-w-md">
                            <Text>ID</Text>
                            <Metric>
                              {instance.id.slice(0, 10)}...
                              {instance.id.slice(-10)}
                            </Metric>
                            <Callout
                              className="mt-4"
                              title="Creating"
                              icon={CheckCircleIcon}
                              color="yellow"
                            >
                              We are creating your whatsapp manager.
                            </Callout>
                          </Card>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          type="button"
                          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={closeModal}
                        >
                          Done
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ChannelDialog;
