import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Timer as TimerIcon,
  Block as BlockIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, total }) => {
  const percentage = total ? (value / total) * 100 : 0;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color, mr: 1, fontSize: 30 }} />
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {total && (
          <>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: `${color}.lighter`,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {percentage.toFixed(1)}% of total actions
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const StatsOverview = ({ stats }) => {
  const total = stats.warnings + stats.deletions + stats.timeouts + stats.bans;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Warnings"
          value={stats.warnings}
          icon={WarningIcon}
          color="warning"
          total={total}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Deletions"
          value={stats.deletions}
          icon={DeleteIcon}
          color="error"
          total={total}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Timeouts"
          value={stats.timeouts}
          icon={TimerIcon}
          color="info"
          total={total}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Bans"
          value={stats.bans}
          icon={BlockIcon}
          color="error"
          total={total}
        />
      </Grid>
    </Grid>
  );
};

export default StatsOverview; 