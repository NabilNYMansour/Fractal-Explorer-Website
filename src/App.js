import './App.css';
import { Canvas } from '@react-three/fiber'
import ShaderPlane from './component/ShaderPlane.tsx';
import Carousel from './component/Carousel.tsx';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import BasicCard from './component/BasicCard.tsx';
import { Box, Button, Card, CardActions, CardContent, Typography } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <div className="main">
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <div className="title">FRACTAL EXPLORER</div>

        <div className="row-container">

          <div className='desc-container'>
            <BasicCard />
          </div>

          <div className='canvas-container'>
            <Canvas>
              <ShaderPlane />
            </Canvas>
          </div>

        </div>

        <div className='image-desc-container'>
          <Card>
            <CardContent>
              <Typography sx={{ mb: 2 }} variant="h5" component="div">
                Screenshots of the game
              </Typography>
              <Carousel />
            </CardContent>
          </Card>
        </div>

        <div className='made-by-container'>
          <Card sx={{ mb: 5 }}>
            <CardContent>
              <Typography sx={{ mb: 2, textAlign: "center" }} variant="h5" component="div">
                Made by
              </Typography>
            </CardContent>
            <CardActions>

              <Button sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                href={'https://github.com/NabilNYMansour'} target="_blank"
              >
                <Box
                  component="img"
                  sx={{
                    // height: 255,
                    display: 'block',
                    maxWidth: 100,
                    width: "100%",
                    overflow: 'hidden',
                    borderRadius: 25,
                  }}
                  src={"https://github.com/NabilNYMansour.png"}
                  alt={"Nabil Mansour's Profile picture"}
                />
                Nabil Mansour
              </Button>

              <Button sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                href={'https://github.com/oceansam'} target="_blank"
              >
                <Box
                  component="img"
                  sx={{
                    display: 'block',
                    maxWidth: 100,
                    width: "100%",
                    overflow: 'hidden',
                    borderRadius: 25,
                  }}
                  src={"https://github.com/oceansam.png"}
                  alt={"Samee Chowdhury's Profile picture"}
                />
                Samee Chowdhury
              </Button>


            </CardActions>
          </Card>
        </div>


      </ThemeProvider>
    </div>
  );
}

export default App;
