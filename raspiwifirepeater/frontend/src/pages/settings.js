import { Switch, Transition } from '@headlessui/react'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { XIcon } from '@heroicons/react/solid'
import React, { Fragment, useEffect, useState } from 'react'
import api from '../services/api';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const intToBool = (int) => {
  if( int == 1 ){
    return true
  }
  return false
}

const Settings = () => {

    const [show, setShow] = useState(false)
    const [successMessage, setSuccessMessage] = useState(true)
    const [wifiCheckEnabled, seWifiCheckEnabled] = useState(false)
    const [passwordShow, setPasswordShow] = useState(false);
    const [networkText, setNetworkText] = useState('')
    const [ssidText, setSsidText] = useState('')
    const [passwordText, setPasswordText] = useState('')

    useEffect(() => {
      async function settingsAsync(){
          const response = await api.get("network/settings/", {
              params: {}
          })
          setNetworkText(response.data.network)
          setSsidText(response.data.ssid)
          setPasswordText(response.data.pswd)
          seWifiCheckEnabled(intToBool(response.data.wifi))
      }
      settingsAsync();
    }, [])

    const save_settings = async () => {
      const response = await api.post("network/settings/", {
        "network" : networkText,
        "ssid": ssidText,
        "pswd": passwordText,
        "wifi": wifiCheckEnabled
      })

      if( response.data.status === 'OK' ){
        setShow(true);
        setSuccessMessage(true);
      }else
      if( response.data.status === 'NOK' ){
        setShow(true);
        setSuccessMessage(false);
      }

      setTimeout(() => {
        setShow(false);
      }, 5000);
    }


    return(
        <>
        <div className="mt-5 p-5">
          <div className="w-full">
            <div className="pb-5">
                {/* Description list with inline editing */}

                <div className="divide-y px-4 py-3 divide-gray-200">
                  <div className="space-y-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Geral</h3>
                    <p className="max-w-2xl text-sm text-gray-500">
                      This device will takes an existing signal from a wireless router or wireless access point and rebroadcasts it to create a second network.
                    </p>
                  </div>

                  <div className="mt-6">
                    <dl className="divide-y divide-gray-200">
                    
                    <Switch.Group as="div" className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:pt-5">
                        <Switch.Label as="dt" className="text-sm font-medium text-gray-500" >
                            Wi-Fi
                        </Switch.Label>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <Switch
                            checked={wifiCheckEnabled}
                            onChange={seWifiCheckEnabled}
                            className={classNames(
                                wifiCheckEnabled ? 'bg-purple-600' : 'bg-gray-200',
                                'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-auto'
                            )}
                            >
                            <span
                                aria-hidden="true"
                                className={classNames(
                                  wifiCheckEnabled ? 'translate-x-5' : 'translate-x-0',
                                  'inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200'
                                )}
                            />
                            </Switch>
                        </dd>
                    </Switch.Group>

                    <div className="py-4">
                        <dt className="text-sm font-medium text-gray-500 uppercase">Network</dt>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          
                        <input
                            type="text"
                            name="network"
                            id="network"
                            onChange={(e) => setNetworkText(e.target.value)}
                            value={ networkText }
                            autoComplete="address-level2"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />

                        </dd>
                      </div>
                      <div className="py-4">
                        <dt className="text-sm font-medium text-gray-500 uppercase">SSID</dt>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <input
                            type="text"
                            name="ssid"
                            id="ssid"
                            onChange={(e) => setSsidText(e.target.value)}
                            value={ ssidText }
                            autoComplete="address-level2"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        </dd>
                      </div>
                      <div className="py-4">
                        <dt className="text-sm font-medium text-gray-500 uppercase">Password</dt>
                        <dd className="mt-1 flex text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          
                        <input
                            type={ passwordShow ? "text" : "password" }
                            name="password"
                            id="password"
                            onClick={(e) => setPasswordShow( !passwordShow )}
                            onChange={(e) => setPasswordText(e.target.value)}
                            value={ passwordText }
                            autoComplete="address-level2"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />

                        </dd>
                      </div>

                    </dl>
                  </div>
                </div>

                <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => { save_settings() }}
                  >
                    Confirm
                  </button>
                </div>

                {/* Global notification live region, render this permanently at the end of the document */}
                <div
                  aria-live="assertive"
                  className="fixed inset-0 z-50 flex items-end px-4 py-6 pointer-events-none" >
                  <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
                    
                    {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
                    <Transition
                      show={show}
                      as={Fragment}
                      enter="transform ease-out duration-300 transition"
                      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-start">
                            { successMessage ?
                              <>
                                <div className="flex-shrink-0">
                                  <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                  <p className="text-sm font-medium text-gray-900">Successfully saved!</p>
                                  <p className="mt-1 text-sm text-gray-500">Your settings were saved successfully.</p>
                                </div>
                              </>
                            : 
                              <>
                                <div className="flex-shrink-0">
                                  <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3 w-0 flex-1 pt-0.5">
                                  <p className="text-sm font-medium text-gray-900">Not saved!</p>
                                  <p className="mt-1 text-sm text-gray-500">Could not save this information.</p>
                                </div>
                              </>
                            }

                            <div className="ml-4 flex-shrink-0 flex">
                              <button
                                className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => {
                                  setShow(false)
                                }}
                              >
                                <span className="sr-only">Close</span>
                                <XIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Transition>
                    
                  </div>
                </div>

              </div>
          </div>
        </div>
        </>
    )
}

export default Settings;