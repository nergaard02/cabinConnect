import type { R } from 'node_modules/framer-motion/dist/types.d-Bq-Qm38R';
import React, { useEffect, useState } from 'react';

import liten from '../utils/images/liten.png';
import moderat from '../utils/images/moderat.png';
import betydelig from '../utils/images/betydelig.png';
import stor from '../utils/images/stor.png';

import fokksno from '../utils/images/fokksno.webp';
import losno from '../utils/images/losno.webp';
import vedvarende from '../utils/images/vedvarende.webp';
import glideskred from '../utils/images/glideskred.webp';
import våteflak from '../utils/images/våteflak.webp';

interface WindExposureProps {
    bitString: string;
    size?: number;
    filledColor?: string;
    emptyColor?: string;
}

export const WindExposureCake: React.FC<WindExposureProps> = ({
    bitString, 
    size = 80,
    filledColor = "#ff0000",
    emptyColor = "#cccccc",
}) => {
    const numSlices = 8;
    const radius = size / 2;

    const slices = Array.from({ length: numSlices }, (_, i) => {
        const angleStart = (i * 360) / numSlices;
        const angleEnd = ((i + 1) * 360) / numSlices;

        const rad = (deg: number) => (deg * Math.PI) / 180;

        const x1 = radius + radius * Math.cos(rad(angleStart - 90));
        const y1 = radius + radius * Math.sin(rad(angleStart - 90));
        const x2 = radius + radius * Math.cos(rad(angleEnd - 90));
        const y2 = radius + radius * Math.sin(rad(angleEnd - 90));

        const largeArcFlag = angleEnd - angleStart > 180 ? 1 : 0;

        const pathData = `M ${radius},${radius} L ${x1},${y1} A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2} Z`;

        const fillColor = bitString[i] === '1' ? filledColor : emptyColor;

        return <path key={i} d={pathData} fill={fillColor} stroke="#000" strokeWidth={1} />;
    });

    return <svg width={size} height={size}>{slices}</svg>
}

const dangerLevelImages: Record<string, string> = {
    '1  Liten': liten,
    '2 Moderat': moderat,
    '3 Betydelig': betydelig,
    '4 Stor': stor,
    '5 Meget stor': stor,
}

const dangerLevelColors: Record<string, string> = {
    '1 Liten': 'bg-lime-300',
    '2 Moderat': 'bg-yellow-400',
    '3 Betydelig': 'bg-orange-500',
    '4 Stor': 'bg-red-600',
    '5 Meget stor': 'bg-black',
};

const dangerLevelTexts: Record<number, string> = {
    1: 'Liten',
    2: 'Moderat',
    3: 'Betydelig',
    4: 'Stor',
    5: 'Meget stor',
}

const avalancheProblemImages: Record<number, string> = {
    5: våteflak,
    7: losno,
    10: fokksno,
    30: vedvarende,
    40: glideskred,
}

const regionId = 3028; // Jotunheimen
const TromsøRegion = 3011; // Tromsø

export const AvelancheWarning: React.FC = () => {
    const [warnings, setWarnings] = useState<any[]>([]);
    const [showDetails, setShowDetails] = useState<boolean[]>([]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchWarnings = async () => {
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            const formatDate = (date: Date) => {
                return date.toISOString().split('T')[0];
            };

            const startDate = formatDate(yesterday);
            const endDate = formatDate(today);

            try {
                const response = await fetch(
                    `https://api01.nve.no/hydrology/forecast/avalanche/v6.3.0/api/Warning/Region/${TromsøRegion}/1/2025-01-03/2025-01-04`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch avalanche warnings");
                }

                const data = await response.json();
                const filteredWarnings = data.filter((w: any) => w.RegId !== 0);
                console.log("Filtered warnings:", filteredWarnings);
                setWarnings(filteredWarnings);
                setShowDetails(new Array(filteredWarnings.length).fill(false));
            } catch (error) {
                console.error("Error fetching avalanche warnings:", error);
            }
        };

        fetchWarnings();
    }, []);

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime);

        let formatted = date.toLocaleDateString("no-No", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        return formatted;
    };

    const formatPublishTime = (publishTime: string) => {
        const date = new Date(publishTime);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
    
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return (
        <div>
          <h2 className="text-xl font-bold mb-2 text-center">
            Avalanche Warnings - Jotunheimen
          </h2>
      
          {warnings.length === 0 ? (
            <p>No warnings found for the past 24 hours.</p>
          ) : (
            <div>
              {/* Selector squares */}
              <div className="flex justify-center gap-4 mb-6">
                {warnings.map((w: any, idx: number) => (
                  <button
                    key={w.RegId}
                    onClick={() => setActiveIndex(idx)}
                    className={`
                      w-16 h-16 rounded-lg shadow-md flex items-center justify-center font-bold text-white
                      ${dangerLevelColors[w.DangerLevelName] || "bg-gray-500"}
                      ${idx === activeIndex ? "ring-4 ring-white" : ""}
                    `}
                  >
                    {w.DangerLevel}
                  </button>
                ))}
              </div>
      
              {/* Show only active warning */}
              {activeIndex !== null && (
                <div key={warnings[activeIndex].RegId} className="mb-6">
                  <div className="flex justify-center gap-6 mb-4">
                    {/* First box */}
                    <div className="flex flex-row h-36 shadow bg-gray-700 w-96">
                      {/* Danger image */}
                      <div
                        className={`${
                          dangerLevelColors[warnings[activeIndex].DangerLevelName] ||
                          "bg-gray-500"
                        } flex items-center justify-center w-28 h-36`}
                      >
                        <img
                          src={dangerLevelImages[warnings[activeIndex].DangerLevelName]}
                          alt={warnings[activeIndex].DangerLevelName}
                          className="w-28 h-28 mr-4"
                        />
                      </div>
      
                      {/* Vertical stacked color bar */}
                      <div className="w-4 h-36 flex flex-col mr-4">
                        <div className="flex-1 bg-black"></div>
                        <div className="flex-1 bg-red-600"></div>
                        <div className="flex-1 bg-orange-500"></div>
                        <div className="flex-1 bg-yellow-400"></div>
                        <div className="flex-1 bg-lime-300"></div>
                      </div>
      
                      <div className="flex flex-col flex-1 justify-center ml-4">
                        <h3 className="text-lg font-semibold">
                          Faregrad {warnings[activeIndex].DangerLevel} -{" "}
                          {
                            dangerLevelTexts[warnings[activeIndex].DangerLevel]
                          }{" "}
                          snøskredfare
                        </h3>
                        <span className="text-sm text-gray-400 mt-1">
                          Publisert:{" "}
                          {formatPublishTime(warnings[activeIndex].PublishTime)}
                        </span>
                      </div>
                    </div>
      
                    {/* Second box: main text */}
                    <div className="flex flex-row h-36 shadow bg-gray-700 w-96">
                      <div
                        className={`${
                          dangerLevelColors[warnings[activeIndex].DangerLevelName]
                        } w-2 h-full mr-4`}
                      />
                      <div className="flex-1 text-sm text-white flex items-center overflow-y-auto">
                        {warnings[activeIndex].MainText}
                      </div>
                    </div>
      
                    {/* Skredfarevurdering */}
                    <div className="text-center max-w-3xl">
                      <h3 className="text-lg font-semibold mb-2">
                        Skredfarevurdering
                      </h3>
                      <p className="text-sm text-white">
                        {warnings[activeIndex].AvalancheDanger}
                      </p>
                    </div>
                  </div>
      
                  {/* Skredproblemer */}
                  <div className="text-center max-w-3xl mx-auto mb-2">
                    <h3 className="text-lg font-semibold mb-4">Skredproblemer</h3>
      
                    <div className="flex flex-row justify-center items-center gap-4">
                      {warnings[activeIndex].AvalancheProblems?.map(
                        (problem: any, pIdx: number) => (
                          <div
                            key={pIdx}
                            className="flex flex-row bg-gray-700 shadow w-96 h-56 text-left text-white"
                          >

                            {/* Vertical danger line */}
                            <div
                              className={`${
                                dangerLevelColors[problem.DangerLevelName]
                              } w-2 h-full mr-4`}
                            />

                            <div className='flex-1 flex flex-col items-center pt-2'>
                                <h4 className='text-md font-semibold mb-2'>
                                    {problem.AvalancheProblemTypeName}
                                </h4>

                                <p className='text-sm text-white text-center'>
                                    {problem.TriggerSenitivityPropagationDestuctiveSizeText}
                                </p>

                                <p className='text-sm text-white italic text-center mt-3'>
                                    {problem.AvalCauseName}
                                </p>

                                <div className='flex flex-row items-start gap-2 mt-2'>
                                    <div className='relative flex items-start'>
                                        <img
                                            src={avalancheProblemImages[problem.AvalancheProblemTypeId]}
                                            alt={problem.AvalancheProblemTypeName}
                                            className='w-16 h-16 mt-1 self-start absolute -left-24'
                                        />

                                        <div className='relative inline-block mt-3'>
                                            <div className='transform origin-bottom rotate-[-22deg]'>
                                                <WindExposureCake
                                                    bitString={problem.ValidExpositions}
                                                    size={50}
                                                    filledColor='#ff0000'
                                                    emptyColor="#cccccc"
                                                />
                                            </div>

                                            {/* Compass letters */}
                                            <div 
                                                className='absolute w-3 h-3 bg-white rounded-full flex items-center justify-center text-[0.55rem] font-bold text-black'
                                                style={{ top: -7, left: 9 }}
                                            >
                                                N
                                            </div>
                                            <div
                                                className='absolute w-3 h-3 bg-white rounded-full flex items-center justify-center text-[0.55rem] font-bold text-black'
                                                style={{ top: 47, left: 9 }}
                                            >
                                                S
                                            </div>
                                            <div 
                                                className='absolute w-3 h-3 bg-white rounded-full flex items-center justify-center text-[0.55rem] font-bold text-black'
                                                style={{ top: 20, left: -17 }}
                                            >
                                                W
                                            </div>
                                            <div
                                                className='absolute w-3 h-3 bg-white rounded-full flex items-center justify-center text-[0.55rem] font-bold text-black'
                                                style={{ top: 20, left: 36 }}
                                            >
                                                E
                                            </div>
                                        </div>

                                        {problem.ExposedHeightFill === 1 && (
                                            <div className='flex flex-row items-center absolute left-[70px] top-[20px]'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="50"
                                                    height="50"
                                                    viewBox="0 0 50 50"
                                                >
                                                    {/* Red avalanche shading */}
                                                    <path
                                                        d="M34.1299,22.8691 L20.1809,1.0741 C19.7079,0.3711 19.1749,0.0461 18.5749,0.0961 C17.9749,0.1461 17.4999,0.5581 17.1459,1.3301 L8.5139,18.9511 C10.8769,18.8161 12.7759,20.6831 12.7759,20.6831 C13.8629,21.6761 14.2179,22.0151 16.1509,22.0291 C19.1399,22.0511 20.0179,20.7691 22.0269,21.4881 C24.3919,22.3371 25.3159,23.3921 27.1709,24.5401 C29.9429,26.2481 31.3449,26.2291 33.0259,25.1611 C33.0259,25.1611 34.6099,24.2071 34.1299,22.8691"
                                                        fill="#d21523"
                                                    />

                                                    {/* Mounatin body */}
                                                    <path
                                                        d="M6.4121,23.752 L1.0791,34.822 C0.6321,35.565 0.5661,36.549 0.8771,37.084 C1.1851,37.623 1.7671,38.58 2.6191,38.58 L39.6821,38.58 C40.5341,38.58 41.1151,37.623 41.4251,37.084 C41.7341,36.549 41.6681,35.219 41.2231,34.479 L36.2291,26.217 C36.4201,27.445 34.3141,28.854 34.3141,28.854 C32.6091,29.992 30.3481,29.959 27.8371,28.975 C25.7441,28.152 24.4491,26.895 22.4571,25.955 C20.4671,25.012 19.3401,26.041 16.5901,26.281 C14.9531,26.424 13.9711,26.166 12.6221,25.324 C12.6221,25.324 9.9561,23.752 6.4601,23.752 L6.4121,23.752 Z"
                                                        fill="#E3E3E3"
                                                    />
                                                </svg>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 12 16"
                                                    className="mt-1"
                                                >
                                                    <polygon
                                                        points="11.92 8 7.947064 8 7.947064 16 3.972936 16 3.972936 8 0 8 5.96 0"
                                                        className="arrow"
                                                        fill="#d21523"
                                                    />
                                                </svg>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="50"
                                                    height="20"
                                                    viewBox="0 0 50 20"
                                                    className="mt-1"
                                                >
                                                    <text
                                                        x="22"
                                                        y="12"
                                                        fontSize="14"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="#fff"
                                                    >
                                                        {problem.ExposedHeight1}m
                                                    </text>
                                                </svg>

                                            </div>
                                        )}
                                        {problem.ExposedHeightFill === 2 && (
                                            <div className='flex flex-row items-center absolute left-[70px] top-[20px]'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="50"
                                                    height="50"
                                                    viewBox="0 0 50 50"
                                                >
                                                    <path
                                                        d="M34.1299,23.0034 L20.1809,1.2094 C19.7079,0.5054 19.1749,0.1804 18.5749,0.2304 C17.9749,0.2814 17.4999,0.6934 17.1459,1.4644 L8.5139,19.0864 C10.8769,18.9514 12.7759,20.8184 12.7759,20.8184 C13.8629,21.8104 14.2179,22.1504 16.1509,22.1644 C19.1399,22.1854 20.0179,20.9044 22.0269,21.6234 C24.3919,22.4714 25.3159,23.5274 27.1709,24.6744 C29.9429,26.3824 31.3449,26.3644 33.0259,25.2954 C33.0259,25.2954 34.6099,24.3414 34.1299,23.0034 Z"
                                                        fill="#E3E3E3"
                                                    />
                                                    <path
                                                        d="M6.4121,23.8867 L1.0791,34.9567 C0.6321,35.6997 0.5661,36.6837 0.8771,37.2187 C1.1851,37.7577 1.7671,38.7147 2.6191,38.7147 L39.6821,38.7147 C40.5341,38.7147 41.1151,37.7577 41.4251,37.2187 C41.7341,36.6837 41.6681,35.3537 41.2231,34.6137 L36.2291,26.3517 C36.4201,27.5797 34.3141,28.9887 34.3141,28.9887 C32.6091,30.1267 30.3481,30.0937 27.8371,29.1097 C25.7441,28.2867 24.4491,27.0297 22.4571,26.0897 C20.4671,25.1467 19.3401,26.1757 16.5901,26.4157 C14.9531,26.5587 13.9711,26.3007 12.6221,25.4587 C12.6221,25.4587 9.9561,23.8867 6.4601,23.8867 Z"
                                                        fill="#d21523"
                                                    />
                                                </svg>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 12 16"
                                                    className="mt-1"
                                                >
                                                    <polygon
                                                        points="11.92 8 7.947064 8 7.947064 16 3.972936 16 3.972936 8 0 8 5.96 0" 
                                                        className="arrow" 
                                                        transform="rotate(180 5.96 8)"
                                                        fill="#d21523"
                                                    />
                                                </svg>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="50"
                                                    height="20"
                                                    viewBox="0 0 50 20"
                                                    className="mt-1"
                                                >
                                                    <text
                                                        x="22"
                                                        y="12"
                                                        fontSize="14"
                                                        textAnchor="middle"
                                                        dominantBaseline="middle"
                                                        fill="#fff"
                                                    >
                                                        {problem.ExposedHeight1}m
                                                    </text>
                                                </svg>
                                            </div>
                                        )}
                                        {problem.ExposedHeightFill === 4 && (
                                            <div className='flex flex-row items-center absolute left-[70px] top-[20px]'>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="50"
                                                    height="50"
                                                    viewBox="0 0 50 50"
                                                >
                                                    <path 
                                                        d="M23.917,14.0537 L19.813,6.6917 C19.387,6.0597 18.906,5.7667 18.367,5.8117 C17.826,5.8577 17.4,6.2277 17.08,6.9217 L14.471,12.8827 L14.384,13.0477 C14.384,13.0477 16.84,12.2817 18.863,13.4277 C20.521,14.3657 21.144,15.3737 23.917,14.0537" 
                                                        fill="#E3E3E3" 
                                                    />

                                                    <path 
                                                        d="M34.2402,31.6182 C34.2402,32.4762 33.0472,33.2112 33.0472,33.2112 C31.3652,34.2792 29.3092,34.7552 26.6252,32.9132 C24.6822,31.5802 23.7362,30.5552 21.4802,29.8612 C19.4402,29.2342 18.5942,30.4242 15.6052,30.4022 C13.6722,30.3892 13.2832,29.8202 12.2282,29.0562 C12.2282,29.0562 10.6742,27.7402 8.6982,27.2612 L8.0602,27.1622 L12.9712,16.2012 C12.9712,16.2012 16.3302,15.4652 18.5802,16.7382 C20.4222,17.7812 23.3102,19.3352 25.7672,17.2022 L34.2402,31.6182" 
                                                        fill="#d21523" 
                                                    />

                                                    <path 
                                                        d="M5.9922,31.7773 L0.8322,43.1953 C0.3852,43.9373 0.3202,44.9223 0.6312,45.4573 C0.9392,45.9963 1.5212,46.9533 2.3732,46.9533 L39.4352,46.9533 C40.2872,46.9533 40.8692,45.9963 41.1782,45.4573 C41.4882,44.9223 41.4222,43.5913 40.9762,42.8513 L36.0102,34.6313 C35.9552,35.6953 34.0682,37.2263 34.0682,37.2263 C32.3632,38.3653 30.1012,38.3323 27.5902,37.3473 C25.4982,36.5253 24.2032,35.2673 22.2112,34.3283 C20.2212,33.3843 19.0942,34.4143 16.3442,34.6543 C14.7072,34.7973 13.7242,34.5393 12.3752,33.6973 C12.3752,33.6973 9.9982,31.7773 6.5022,31.7773 L5.9922,31.7773 Z" 
                                                        fill="#E3E3E3" 
                                                    />
                                                </svg>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="32"
                                                    viewBox="0 0 12 34"
                                                    className="mt-1"
                                                >
                                                    <polygon 
                                                        points="11.92 8 7.947064 8 7.947064 16 3.972936 16 3.972936 8 0 8 5.96 0" 
                                                        className="arrow" 
                                                        transform="rotate(180 5.96 8)"
                                                        fill="#d21523"
                                                    />

                                                    <polygon 
                                                        points="11.92 8 7.947064 8 7.947064 16 3.972936 16 3.972936 8 0 8 5.96 0" 
                                                        className="arrow"
                                                        transform="translate(0,18)"
                                                        fill="#d21523"
                                                    />
                                                </svg>

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="80"
                                                    height="40"
                                                    viewBox="0 0 80 40"
                                                    className="mt-1"
                                                >
                                                    <text
                                                        x="5"
                                                        y="12"
                                                        fontSize="14"
                                                        textAnchor="start"
                                                        dominantBaseline="middle"
                                                        fill="#fff"
                                                    >
                                                        {problem.ExposedHeight2}-
                                                    </text>
                                                    <text
                                                        x="5"
                                                        y="32"
                                                        fontSize="14"
                                                        textAnchor="start"
                                                        dominantBaseline="middle"
                                                        fill="#fff"
                                                    >
                                                        {problem.ExposedHeight1}m
                                                    </text>
                                                </svg>
                                            
                                            </div>
                                        )}
                                    </div>
                                </div>
                          </div>                       
                        </div>
                      ))}
                    </div>
      
                    {/* Snow history + mountain weather */}
                    <div className="w-full mt-6">
                      <h2 className="text-lg font-semibold text-white mb-3">
                        Snødekkehistorikk og fjellvær
                      </h2>
                      <div className="flex flex-rox gap-4 mt-6 w-full justify-center">
                        {/* Snødekkehistorikk */}
                        <div className="bg-gray-700 shadow w-96 h-64 p-4 text-white overflow-y-auto">
                          <h3 className="text-2xl font-semibold mb-2">
                            Snødekkehistorikk
                          </h3>
                          <p className="text-sm text-white font-bold">
                            {formatDate(warnings[activeIndex].PublishTime)}
                          </p>
                          <p className="text-sm text-gray-300">
                            {warnings[activeIndex].SnowSurface}
                            <br />
                            <br />
                            {warnings[activeIndex].CurrentWeaklayers}
                            <br />
                            <br />
                            {warnings[activeIndex].LatestObservations}
                          </p>
                        </div>
      
                        {/* Fjellvær */}
                        <div className="bg-gray-700 shadow w-96 p-4 text-white">
                          <h3 className="text-2xl font-semibold mb-2">Fjellvær</h3>
                          <p className="text-sm text-white font-bold">
                            {formatDate(
                              warnings[activeIndex].MountainWeather.LastSavedTime
                            )}
                          </p>
                          {warnings[activeIndex].MountainWeather &&
                          warnings[activeIndex].MountainWeather.MeasurementTexts
                            .length > 0
                            ? warnings[activeIndex].MountainWeather.MeasurementTexts.map(
                                (mt: any, mIdx: number) => (
                                  <p key={mIdx} className="text-sm text-gray-300">
                                    {mt.Text}
                                  </p>
                                )
                              )
                            : null}
                        </div>
                      </div>
                    </div>
                  </div>
      
                  {/* Råd */}
                  <div className="mt-6 text-center">
                    <h2 className="text-lg font-semibold text-white mb-3">Råd</h2>
                    <div className="flex flex-wrap justify-center items-start gap-10">
                      {warnings[activeIndex].AvalancheAdvices.map(
                        (advice: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gray-700 text-white shadow-md min-w-[200px] max-w-sm"
                          >
                            <img
                              src={advice.ImageUrl}
                              alt={`Advice ${idx}`}
                              className="w-full mb-3"
                            />
                            <p className="text-sm text-gray-300">{advice.Text}</p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className='text-center text-xs text-gray-400 mt-8'>
            Avalanche warnings provided by
            <a
                href="https://nve.no"
                target="_blank"
                rel="noopener noreferrer"
                className='underline hover:text-gray-300 ml-1'
            >
                NVE (Norges vassdrags- og energidirektorat)
            </a>
          </div>
        </div>
      );
};
