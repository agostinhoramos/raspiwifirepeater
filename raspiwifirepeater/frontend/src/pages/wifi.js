import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Switch, Transition } from '@headlessui/react'
import { XIcon } from '@heroicons/react/solid'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/outline'
import { Link } from 'react-router-dom'
import {
  WifiIcon,
  ExclamationIcon,
} from '@heroicons/react/outline'

import api from '../services/api';

const signalStyles = {
  2 : 'bg-green-100 text-green-900',
  1 : 'bg-yellow-100 text-yellow-900',
  0 : 'bg-red-100 text-red-900',
}

const signalLabels = {
  0 : 'Unstable',
  1 : 'Minimun',
  2 : 'Excelent'
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Overview = () => {
  const [showConnectWiFiModal, setShowConnectWiFiModal] = useState(false)
  const cancelButtonRef = useRef(null)

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkSameSSID, setCheckSameSSID] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState({security: {boo: false}});
  const [passwordValue, setPasswordValue] = useState('');
  const [passwordShow, setPasswordShow] = useState(false);

  const [show, setShow] = useState(false)
  const [successMessage, setSuccessMessage] = useState(true)

  useEffect(() => {
    async function localNetworkActivity(){
      const network_list = []
      const response = await api.get("network/scan/", {})
      
      var i = 1;
      response.data.list.forEach(element => {
          if (element.ssid != null){
            network_list.push(
              {
                id: i,
                name: element.ssid,
                channel: element.channel,
                mac: element.address,
                security: {
                  name: element.sec.name,
                  boo: (element.sec.boo === 1 ? true : false)
                },
                signal: {
                  name: signalLabels[element.level],
                  id: element.level
                },
              }
            );
            i++;
          }
      });

      setPosts(network_list);
      setLoading(false);
    }

    // Call function
    localNetworkActivity();
    const interval = setInterval(() => {
      localNetworkActivity();
    }, 5000);
    return () => clearInterval(interval);

  }, [])

  const showWiFiPopUp = (network) => {
    
    // clean preview password before start
    setPasswordValue('');
    
    if( network.name ){
      setCurrentNetwork(network);
      setShowConnectWiFiModal(true);
    }
  }

  const onConnectClick = async () => {
    
    const send_data = {
      mac: currentNetwork.mac,
      ssid: currentNetwork.name,
      pass: passwordValue,
      security: currentNetwork.security.name,
      updateSSID: checkSameSSID
    }
    
    const response = await api.post("network/create/", {
      config: send_data,
      secure: true
    })

    if( response.data.status === 'OK' ){
      setSuccessMessage(true);
      setShow(true);
    }else
    if( response.data.status === 'NOK' ){
      setSuccessMessage(false);
      setShow(true);
    }

    setTimeout(() => {
      setShow(false);
    }, 5000);
  }

  return (
    <>
      <div className="mt-5 p-5">

        <div className="w-full">

            {/* RECENT PEOPLE */}
            { !loading ?
              <h2 className="text-lg leading-6 font-medium mb-5 text-gray-500">Select an existing network you would like to extend:</h2>
            : '' }
            <div className="flex flex-col mt-2">
              { !loading ?
                <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Network Name
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Channel
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MAC address
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Security
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Signal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      { posts.map((network) => (
                        <tr key={network.id} className={`bg-white hover:bg-gray-100 cursor-pointer ${network.name ? '' : 'opacity-30'}`} onClick={(e)=>{ showWiFiPopUp(network); }}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-gray-900" >{network.id}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex">
                              <WifiIcon
                                className="flex-shrink-0 h-5 w-5 text-blue-400"
                                aria-hidden="true"
                              />
                              <p className="text-gray-500 ml-3 truncate">
                                {network.name ? network.name : '-- HIDDEN NETWORK --'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-gray-900 ">{network.channel} </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-gray-900 ">{network.mac} </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-gray-900 uppercase">{network.security.name} </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={classNames(
                              signalStyles[network.signal.id],
                              'inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium uppercase'
                            )} >{network.signal.name} </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              :
              <>
                  <div className='flex items-center justify-center h-screen -mt-32'>
                      <div className="w-20 h-20 border-8 border-blue-400 border-dotted rounded-full animate-spin"></div>
                  </div>
              </>
              }
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
                                <p className="text-sm font-medium text-gray-900">Network <b>{ currentNetwork.name }</b> created successfully!</p>
                                <p className="mt-1 text-sm text-gray-500">All settings were applied successfully.</p>
                              </div>
                            </>
                          : 
                            <>
                              <div className="flex-shrink-0">
                                <XCircleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
                              </div>
                              <div className="ml-3 w-0 flex-1 pt-0.5">
                                <p className="text-sm font-medium text-gray-900">Not created!</p>
                                <p className="mt-1 text-sm text-gray-500">Could not applied some changes.</p>
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

    {/* Start Modals */}
    <Transition.Root show={showConnectWiFiModal} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setShowConnectWiFiModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end sm:items-center justify-center min-h-full p-4 text-center sm:p-0">
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
        
                    <div className="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Connect to Wi-Fi
                      </Dialog.Title>
                      <div className="mt-2">
                        <div className="mt-2 col-span-6 sm:col-span-6 lg:col-span-2">
                          <label htmlFor="wifi_ssid" className="block text-sm font-medium text-gray-700">
                            SSID
                          </label>
                          <input
                            type="text"
                            value={currentNetwork.name}
                            name="wifi_ssid"
                            id="wifi_ssid"
                            autoComplete="address-level2"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        
                        { currentNetwork.security.boo ?
                        <div className="mt-2 col-span-6 sm:col-span-6 lg:col-span-2">
                          <label htmlFor="wifi_password" className="block text-sm font-medium text-gray-700">
                            Password
                          </label>

                          <input
                            type={ passwordShow ? "text" : "password" }
                            name="wifi_password"
                            value={passwordValue}
                            onChange={(e) => setPasswordValue(e.target.value)}
                            onClick={(e) => setPasswordShow( !passwordShow )}
                            title={ "Click to show/hide you password" }
                            id="wifi_password"
                            autoComplete="address-level2"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          />
                        </div> : '' }

                        <div className="mt-3 flex items-center">
                          <input
                            id="push-everything"
                            name="push-notifications"
                            type="checkbox"
                            onClick={(e) => setCheckSameSSID( !checkSameSSID )}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                            checked={ checkSameSSID ? true : null }
                          />
                          <label htmlFor="push-everything" className="ml-3 block text-sm font-medium text-gray-700">
                            Use same SSID to access point
                          </label>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {setShowConnectWiFiModal(false); onConnectClick();} }
                  >
                    Connect
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowConnectWiFiModal(false)}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            
          </div>
        </div>
      </Dialog>
    </Transition.Root>
    {/* End Modals */}
    </>
  )
};
  
export default Overview;