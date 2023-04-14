import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { GitHub, YouTube } from '@mui/icons-material';

export default function BasicCard() {
  return (
    <Card>
      <CardContent>
        <Typography sx={{ mb: 2 }} variant="h5" component="div">
          Can you escape the fractal world?
        </Typography>

        <Typography sx={{ mb: 2.5 }} component="div" color="text.secondary">
          Fractal Explorer is a VR experience where the player explores an endless fractal world made with the ray marching algorithm.
        </Typography>

        <Typography sx={{ mb: 2.5 }} component="div" color="text.secondary">
          Made with the unity game engine.
        </Typography>

        <Typography component="div" color="text.secondary">
          This project is the final assignment for CPS643 course at Toronto Metropolitan University.
        </Typography>

      </CardContent>
      <CardActions>
        <Button sx={{ padding: "5px" }} size="small" href={'https://github.com/NabilNYMansour/Fractal-Explorer'} target="_blank">
          <GitHub /> &nbsp; GitHub Repository
        </Button>
        <Button sx={{ padding: "5px" }} size="small" href={'https://www.youtube.com/watch?v=-RkAV7bAaSk'} target="_blank" color="error">
          <YouTube /> &nbsp; Gameplay Video
        </Button>
      </CardActions>
    </Card>
  );
}