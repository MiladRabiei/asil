'use client';
import { useEffect } from 'react';
// import Image from 'next/image';
import { redirect } from 'next/navigation';
// import authSuccessionVectorAddress from '@public/img/svg/authSuccessfulLoginSvg.svg';

const LoginSuccession = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      redirect('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full h-screen flex items-center justify-center">
      <div className="flex flex-col p-md h-full gap-md bg-base-300 w-full rounded-lg items-center justify-center">
        <h3 className="text-neutral-content text-base font-semibold text-center">
          ورود به حساب کاربری
        </h3>
        {/* <Image src={authSuccessionVectorAddress} alt="authSuccessionVector" /> */}
        <h3 className="text-neutral-content text-base font-semibold text-center">
          با موفقیت انجام شد.
        </h3>
      </div>
    </section>
  );
};

export default LoginSuccession;
