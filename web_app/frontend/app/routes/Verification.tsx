import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
const backendUrl = "http://127.0.0.1:8000"

const Verification: React.FC = () => {
    const { email } = useParams();
    const navigate = useNavigate();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [code, setCode] = useState<string[]>(Array(6).fill(''));

    if (inputRefs.current.length !== 6) {
        inputRefs.current = Array(6).fill(null);
    }

    const handleChange = async (index:number, value:string) => {
        // If  the input is not a digit or empty, return immediately
        if (!/^\d?$/.test(value)) return;

        // Create a shallow copy of the code array
        const newCode = [...code];

        // Update the specific index with the new value, and update the state
        newCode[index] = value;
        setCode(newCode);

        // Move to the next box if the current box holds a value and if it is not the last box
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check if all input boxes are filled, if so, join them together into one string
        if(newCode.every((char) => char !== '')) {
            const fullCode = newCode.join('');
            
            try {
                const response = await fetch(`${backendUrl}/resident/verify/${email}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        code: fullCode,
                        email: email
                    })

                });

                const data = await response.json();

                if (response.ok) {
                    alert("Verification successful!");
                    navigate('/login');
                }
                else {
                    alert(data.message);
                }

            } catch (error) {
                alert(error);
                return;
            }
        }
    };

    const handleKeyDown = (e:  React.KeyboardEvent, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleResend = async () => {
        try {
            const  response = await fetch(`${backendUrl}/resident/resend/code/${email}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                });
                
                const data = await response.json();

                if (response.ok) {
                    alert("Verification code re-sent");
                }
                else {
                    alert(data.message);
                }
        } catch (error) {
            alert(error);
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col items-center justify center text-white pt-48" style={{ opacity: 1 }}>
            <h1 className="text-4xl press-start font-bold mb-6" style={{ transform: 'none' }}>Verify your account</h1>
            <div className="h-48">
                <img
                src="/email.png"
                className="mx-auto w-28 h-28"
                alt="Mail Icon"
                />
            </div>
            <p className="text-lg mb-4">Enter the verification code sent to: <strong>{email}</strong></p>
            <br></br>
            <div className="flex justify-center space-x-4 mb-4">
                {code.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        ref={(el) => {inputRefs.current[index] = el;}}
                        className="w-12 h-14 border-2 border-gray-300 rounded text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 text-white bg-transparent"
                    />
                ))}
            </div>

            <p className="text-lg mb-4">
                Didn't receive a code? Check your spam folder, or{' '}
                <button
                    onClick={handleResend}
                    className="text-blue-400 hover:underline focus:outline-none"
                >
                    resend code
                </button>
            </p>
        </div>
    )
};

export default Verification;