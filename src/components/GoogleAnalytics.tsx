"use client";

import Script from "next/script";

const MEASUREMENT_ID = "G-N2G4XC200X";

export function GoogleAnalytics() {
  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`if (window.location.hostname === 'ando-seika.com') {
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${MEASUREMENT_ID}', {
            page_location: window.location.origin + window.location.pathname,
            page_referrer: document.referrer ? document.referrer.split('?')[0].split('#')[0] : '',
            allow_google_signals: false,
            allow_ad_personalization_signals: false
          });
          var script = document.createElement('script');
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}';
          document.head.appendChild(script);
        }`}
      </Script>
    </>
  );
}
