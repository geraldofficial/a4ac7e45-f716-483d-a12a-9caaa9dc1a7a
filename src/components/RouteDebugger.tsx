import React from "react";
import { useParams, useLocation } from "react-router-dom";

export const RouteDebugger: React.FC = () => {
  const params = useParams();
  const location = useLocation();

  return (
    <div className="fixed top-20 right-4 bg-black/90 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">Route Debug</h3>
      <div>Pathname: {location.pathname}</div>
      <div>Params: {JSON.stringify(params)}</div>
      <div>Search: {location.search}</div>
    </div>
  );
};
