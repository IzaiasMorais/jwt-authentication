import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react";
import { Can } from "../components/Can";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";

import { withSSRAuth } from "../utils/withSSRAuth";

export default function DashBoard() {
  const { user, signOut, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  // useEffect(() => {
  //   api
  //     .get("/me")
  //     .then((response) => console.log(response))
  //     .catch((err) => console.log(err));
  // });

  return (
    <>
      <h1>DashBoard: {user?.email}</h1>
      <button onClick={signOut}>Sign out</button>
      <br /> <br />
      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  // @ts-ignore
  const apiClient = setupAPIClient(ctx);

  const response = await apiClient.get("/me");

  return {
    props: {},
  };
});
