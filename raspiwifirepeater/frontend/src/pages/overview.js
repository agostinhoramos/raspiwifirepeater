import {
    SwitchHorizontalIcon,
    XIcon,
    WifiIcon,
} from '@heroicons/react/outline'

import api from '../services/api';

import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import internet_img from './../images/internet_img.png'
import repeater_img from './../images/repeater_img.png'
import router_img from './../images/router_img.png'

const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ')
}

const signalStyles = {
    2 : 'text-green-600',
    1 : 'text-yellow-600',
    0 : 'text-red-600',
}

const signalLabels = {
    0 : 'Unstable',
    1 : 'Minimun',
    2 : 'Excelent'
}

const Overview = () => {

    const [internetStatus, setInternetStatus] = useState({});
    const [routerStatus, setRouterStatus] = useState({});
    const [repeaterStatus, setRepeaterStatus] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStatusAsync(){
            const response = await api.get("network/status/", {})
            
            const d = response.data.data;

            setInternetStatus({
                status: d.internet.status,
                address: d.internet.address
            })
            setRouterStatus({
                status: d.router.status,
                address: d.router.address,
                ssid: d.router.ssid,
                signal: d.router.signal
            })
            setRepeaterStatus({
                status: d.repeater.status,
                address: d.repeater.address,
                ssid: d.repeater.ssid,
            })

            setLoading(false);
        }

        // Call function
        loadStatusAsync();
        const interval = setInterval(() => {
            loadStatusAsync();
        }, 5000);
        return () => clearInterval(interval);
    }, [])

    return(
    <>
    <div className="mt-5 p-5 ">
        <div className="w-full ">
            { loading ? 
                <>
                    <div className='flex items-center justify-center h-screen -mt-32'>
                        <div className="w-20 h-20 border-8 border-blue-400 border-dotted rounded-full animate-spin"></div>
                    </div>
                </>
            :
                <>
                    <div className="flex justify-center mt-5">
                        <div className="-bg-blue-100">
                            <div className='mt-2 mb-2 font-semibold text-lg p-0 m-0 block text-center uppercase'>Internet</div>
                            <img className={classNames(
                                internetStatus.status ? "" : "opacity-30",
                                "inline"
                            )} width={"260px"} height={"260px"} src={internet_img} ></img>
                            <div className='mt-2 font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>IP Address: <span className='text-gray-500' >{internetStatus.address ? internetStatus.address : 'N/A'}</span></div>
                            <div className='font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>STATUS: <span className='text-gray-500' >{internetStatus.status ? 'CONNECTED' : 'DISCONNECTED'}</span></div>
                        </div>
                        <div className="mx-8 my-auto">
                            {internetStatus.status && routerStatus.status? 
                                <SwitchHorizontalIcon
                                    className="flex-shrink-0 my-20 h-20 w-20 text-blue-400"
                                    aria-hidden="true"
                                />
                                : 
                                <XIcon
                                    className="flex-shrink-0 my-20 h-20 w-20 text-red-400"
                                    aria-hidden="true"
                                />
                            }
                        </div>
                        <div className="-bg-blue-100 relative">
                            <div className='mt-2 mb-2 font-semibold text-lg p-0 m-0 block text-center uppercase'>Router</div>
                            <img className={classNames(
                                routerStatus.status ? "" : "opacity-30",
                                "inline"
                            )} width={"260px"} height={"260px"} src={router_img} ></img>
                            <div className='mt-5 font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>IP Address: <span className='text-gray-500' >{routerStatus.address ? routerStatus.address : 'N/A'}</span></div>
                            <div className='font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>SSID: <span className='text-gray-500' >{routerStatus.ssid ? routerStatus.ssid : 'N/A'}</span></div>
                            <div className='font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>SIGNAL: <span className={`uppercase ${signalStyles[routerStatus.signal]}`} >{signalLabels[routerStatus.signal]}</span></div>
                        </div>
                        <div className="mx-8 my-auto text-center">
                            {repeaterStatus.status && routerStatus.status ? 
                                <SwitchHorizontalIcon
                                    className="flex-shrink-0 my-20 h-20 w-20 text-blue-400"
                                    aria-hidden="true"
                                />
                                : 
                                <XIcon
                                    className="flex-shrink-0 my-20 h-20 w-20 text-red-400"
                                    aria-hidden="true"
                                />
                            }
                        </div>
                        <div className="-bg-blue-100">
                            <div className='mt-2 mb-2 font-semibold text-lg p-0 m-0 block text-center uppercase'>Repeater</div>
                            <img className="inline" width={"260px"} height={"260px"} src={repeater_img} ></img>
                            <div className='font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>IP Address: <span className='text-gray-500' >{repeaterStatus.address ? repeaterStatus.address : 'N/A'}</span></div>
                            <div className='font-semibold text-lg p-0 m-0 block text-gray-400 text-center'>SSID: <span className='text-gray-500' >{repeaterStatus.ssid ? repeaterStatus.ssid : 'N/A'}</span></div>
                        </div>
                    </div>

                    <div className='w-full text-center mt-20'>
                        <Link to="/wifi">
                        <button type="button"
                            className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                        <WifiIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
                            WiFi Scanner
                        </button>
                        </Link>
                    </div>
                </>
            }
        </div>
    </div>
    </>
    )
}

export default Overview;