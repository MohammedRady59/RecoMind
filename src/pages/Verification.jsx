import { useState, useRef, useEffect } from "react";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import Key from "../assets/images/Key.png";

const Verification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const inputRefs = useRef([]);

  const [counter, setCounter] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  const handleResend = () => {
    if (!canResend) return;
    setCounter(30);
    setCanResend(false);
    console.log("Resending verification code...");
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    const digit = value.slice(-1);
    newOtp[index] = digit;
    setOtp(newOtp);
    setMessage(null);
    if (digit && index < otp.length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text/plain").trim();
    if (/^\d{4}$/.test(pasted)) {
      setOtp(pasted.split(""));
      setMessage(null);
      inputRefs.current[otp.length - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    setMessage(null);
    const code = otp.join("");
    if (code.length !== 4) {
      setMessage({ type: "error", text: "Please enter the 4-digit code." });
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    if (code === "1234") {
      setMessage({
        type: "success",
        text: "Verification successful! You are being logged in.",
      });
    } else {
      setMessage({
        type: "error",
        text: "Invalid code. Please check your email and try again.",
      });
    }

    setIsLoading(false);
  };

  const successColor = "#64b883";
  const errorColor = "#df5d5d";
  const isOtpFilled = otp.join("").length === 4;
  const otpIsValid = message?.type === "success";
  const otpIsInvalid = message?.type === "error";

  return (
    <div className="container min-h-screen flex flex-col md:flex-row items-center justify-center gap-12 p-6 md:p-8 mx-auto">
      {/* Left Section */}
      <div className="flex-1 flex flex-col items-center md:items-start justify-center w-full">
        <img
          src={Key}
          alt="Key Illustration"
          className="w-[300px] sm:w-[400px] md:w-[500px] lg:w-[547px] h-auto "
        />
      </div>

      {/* Right Section (Verification Form) */}
      <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full max-w-[600px] min-h-[620px] bg-[var(--Primary)] p-6 sm:p-10 md:p-[74px] rounded-lg shadow-2xl">
        <h1 className="text-5xl font-normal mb-[52px] text-[var(--Secondary)]">
          Verification Code
        </h1>
        <p className="text-start font-medium text-xl text-[var(--font_primary)] mb-4">
          A verification code has been sent to your Email via Gmail. Enter the
          code to proceed.
        </p>

        <div className="flex justify-center gap-5.5 mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              ref={(el) => (inputRefs.current[i] = el)}
              disabled={isLoading}
              className={`w-[60px] h-[60px] md:w-[75px] md:h-[75px] text-center text-3xl font-medium rounded-lg border-2 bg-transparent text-[var(--font_primary)] transition duration-150 focus:ring-0 outline-none ${
                otpIsValid
                  ? "border-[var(--success)]"
                  : otpIsInvalid
                  ? "border-[var(--error)]"
                  : "border-[var(--Secondary)] focus:border-[var(--Secondary)]"
              }`}
            />
          ))}
        </div>

        <div className="text-base font-normal text-[var(--font_Primary)] mb-6">
          Didn’t receive a code?{" "}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`font-medium underline transition-all ${
              canResend
                ? "text-[var(--Secondary)] hover:opacity-80"
                : "text-gray-500 cursor-not-allowed no-underline"
            }`}
          >
            Resend Code,
          </button>{" "}
          {canResend ? (
            <span className="text-[var(--Secondary)]">now.</span>
          ) : (
            <span className="text-[var(--Secondary)]">
              After <strong>{counter}</strong> second{counter !== 1 && "s"}.
            </span>
          )}
        </div>

        {message && (
          <div
            className="flex items-center gap-2 p-3 w-full rounded-lg mb-4"
            style={{
              backgroundColor:
                message.type === "success"
                  ? `${successColor}20`
                  : `${errorColor}20`,
              border: `1px solid ${
                message.type === "success" ? successColor : errorColor
              }`,
              color: message.type === "success" ? successColor : errorColor,
            }}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={isLoading || !isOtpFilled}
          className="w-full rounded-lg py-3 font-semibold text-xl transition-all bg-[var(--Secondary)] text-[var(--Primary)] hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
          ) : (
            "Verify"
          )}
        </button>
      </div>
    </div>
  );
};

export default Verification;
