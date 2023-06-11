import * as React from 'react';

import AppStrings from '../lib/strings';
import Head from 'next/head';
import ResponsiveAppBar from '../components/ResponsiveAppBar';
import TabContainer from '../components/TabContainer';
import { styled } from '@mui/material';

const Root = styled('div')(({ theme }) => {
  return {
    textAlign: 'center',
    padding: theme.spacing(2),
  };
});

function Overview() {
  return (
    <React.Fragment>
      <Head>
        <title>{AppStrings.overviewTitle}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </Head>
      <ResponsiveAppBar />
      <Root>
        <TabContainer />
      </Root>
    </React.Fragment>
  );
}

export default Overview;