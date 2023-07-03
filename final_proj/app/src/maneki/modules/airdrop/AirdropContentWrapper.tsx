import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useModalContext } from 'src/hooks/useModal';
import { useAirdropContext } from 'src/maneki/hooks/airdrop-data-provider/AirdropDataProvider';

import { airdropListType } from './AirdropContainer';

export default function AirdropContentWrapper({
  title,
  status,
  tooltipContent,
  entry,
  isClaimed,
  airdropNumber,
}: airdropListType) {
  const { openAirDrop } = useModalContext();
  const { setCurrentSelectedAirdrop } = useAirdropContext();
  return (
    <Paper
      sx={(theme) => ({
        width: '100%',
        px: 6,
        py: 6,
        borderRadius: '10px',
        mx: 'auto',
        mb: '32px',
        boxShadow: `0px 10px 30px 10px ${theme.palette.shadow.dashboard}`,
      })}
    >
      <Box>
        <Typography variant="h2" color="text.secondary" sx={{ ml: '16px' }}>
          {title} ({status})
        </Typography>
        {tooltipContent}
      </Box>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            p: '24px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              p: '12px 24px',
              backgroundColor: 'background.custom1',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: '16px',
            }}
          >
            <FormattedNumber
              value={
                entry
                  ? ethers.BigNumber.from(entry.amount.substring(0, entry.amount.length - 1))
                      .div(ethers.BigNumber.from('1000000000000000000'))
                      .toString()
                  : 0
              }
              variant="secondary14"
            />
            <Typography sx={{ fontWeight: '500' }}>PAW</Typography>
          </Box>
          <Button
            onClick={() => {
              setCurrentSelectedAirdrop(airdropNumber);
              openAirDrop();
            }}
            variant="contained"
            sx={{ width: '100%', display: 'block', p: '12px 24px', borderRadius: '4px' }}
            disabled={!entry || isClaimed}
          >
            {!entry ? (
              <Trans>Not Eligible</Trans>
            ) : isClaimed ? (
              <Trans>Claimed</Trans>
            ) : (
              <Trans>Claim</Trans>
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
