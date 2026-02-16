/**
 * @file src/components/feedback/lottie-handler/index.tsx
 */

import LottieSuccess from "@/assets/svg/success.svg?react";
import LottieError from "@/assets/svg/error.svg?react";

const lottieSvgsMap = {
  "lottie-success": LottieSuccess,
  "lottie-error": LottieError,
};

interface LottieHandlerProps {
  type: keyof typeof lottieSvgsMap;
  title: string;
  message: string;
  className: string;
}

const LottieHandler = ({
  type,
  title,
  message,
  className,
}: LottieHandlerProps) => {
  const Lottie = lottieSvgsMap[type];
  return (
    <div className="text-center pt-4 pb-4">
      <Lottie width={130} height={130} title={title} aria-hidden="true" />
      <h3 className={className} style={{ fontSize: "17px" }}>
        {message}
      </h3>
    </div>
  );
};

export default LottieHandler;
