/*
========================================
PERLIN NOISE ALGORITHM
========================================
Adapted from KEN PERLINS IMPOROVED PERLIN NOISE in JAVA and Abdelrahman Said'S 2D implementation in C

*/
export class Perlin {
   constructor(seed = 1337) {
      this.PERMUTATION_COUNT = 256;
      this.perm = new Uint32Array(this.PERMUTATION_COUNT * 2);

      this.rngState = seed >>> 0;

      this.init(seed);
   }

   randomU32() {
      let x = this.rngState;

      x ^= x << 13;
      x ^= x >>> 17; //force unsigned values
      x ^= x << 5;

      this.rngState = x >>> 0;
      return this.rngState;
   }

   //Fisher-Yates shuffle
   shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
         const j = this.randomU32() % (i + 1);

         const tmp = array[i];
         array[i] = array[j];
         array[j] = tmp;
      }
   }

   //Initialize permutation table
   init(seed = 1337) {
      this.rngState = seed >>> 0;

      const tmp = new Uint32Array(this.PERMUTATION_COUNT);

      for (let i = 0; i < this.PERMUTATION_COUNT; i++) {
         tmp[i] = i;
      }

      this.shuffle(tmp);

      for (let i = 0; i < this.PERMUTATION_COUNT; i++) {
         this.perm[i] = tmp[i];
         this.perm[i + this.PERMUTATION_COUNT] = tmp[i];
      }
   }

   //Fade function - Perlin's smoothstep-like quintic curve
   fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
   }

   lerp(t, a, b) {
      return a + t * (b - a);
   }

   /*
   Corresponds to Abdelrahman Said's simplfied ver of gradients:
   ( 1, 0)
   (-1, 0)
   ( 0, 1)
   ( 0,-1)
   */
   gradient2D(hash, x, y) {
      switch (hash & 3) {
         case 0: return x;
         case 1: return -x;
         case 2: return y;
         default: return -y;
      }
   }

   // Perlin Noise 2D
   noise2D(x, y) {
      const fx = Math.floor(x);
      const fy = Math.floor(y);

      const xu = fx & 255;
      const yu = fy & 255;

      x -= fx;
      y -= fy;

      const a = this.perm[xu] + yu;
      const b = this.perm[xu + 1] + yu;

      const u = this.fade(x);
      const v = this.fade(y);

      const g00 = this.gradient2D(this.perm[a], x, y);
      const g10 = this.gradient2D(this.perm[b], x - 1, y);
      const g01 = this.gradient2D(this.perm[a + 1], x, y - 1);
      const g11 = this.gradient2D(this.perm[b + 1], x - 1, y - 1);

      return this.lerp(
         v,
         this.lerp(u, g00, g10),
         this.lerp(u, g01, g11)
      );
   }

   reseed(seed) {
   this.init(seed);
   }
}


/*
Generate an n-dimensional grid or lattice.
At each point on the grid, generate a gradient vector. These vectors should be consistent when moving between grid cells. The top right corner of the first cell in a 2D grid should have the exact same vector as the top left corner of the second cell.
Given an n-dimensional point, find the grid cell to which the point belongs.
Calculate distance vectors between the point and all of the grid corner.
Calculate the dot product between each of the distance vectors and its equivalent gradient vector.
Interpolate between the dot products using a combination of smoothstep and linear interpolation functions.
 */

/*

"This code implements the algorithm I describe in a corresponding SIGGRAPH 2002 paper."
// JAVA REFERENCE IMPLEMENTATION OF IMPROVED NOISE - COPYRIGHT 2002 KEN PERLIN.

public final class ImprovedNoise {
   static public double noise(double x, double y, double z) {
      int X = (int)Math.floor(x) & 255,                  // FIND UNIT CUBE THAT
          Y = (int)Math.floor(y) & 255,                  // CONTAINS POINT.
          Z = (int)Math.floor(z) & 255;
      x -= Math.floor(x);                                // FIND RELATIVE X,Y,Z
      y -= Math.floor(y);                                // OF POINT IN CUBE.
      z -= Math.floor(z);
      double u = fade(x),                                // COMPUTE FADE CURVES
             v = fade(y),                                // FOR EACH OF X,Y,Z.
             w = fade(z);
      int A = p[X  ]+Y, AA = p[A]+Z, AB = p[A+1]+Z,      // HASH COORDINATES OF
          B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;      // THE 8 CUBE CORNERS,

      return lerp(w, lerp(v, lerp(u, grad(p[AA  ], x  , y  , z   ),  // AND ADD
                                     grad(p[BA  ], x-1, y  , z   )), // BLENDED
                             lerp(u, grad(p[AB  ], x  , y-1, z   ),  // RESULTS
                                     grad(p[BB  ], x-1, y-1, z   ))),// FROM  8
                     lerp(v, lerp(u, grad(p[AA+1], x  , y  , z-1 ),  // CORNERS
                                     grad(p[BA+1], x-1, y  , z-1 )), // OF CUBE
                             lerp(u, grad(p[AB+1], x  , y-1, z-1 ),
                                     grad(p[BB+1], x-1, y-1, z-1 ))));
   }
   static double fade(double t) { return t * t * t * (t * (t * 6 - 15) + 10); }
   static double lerp(double t, double a, double b) { return a + t * (b - a); }
   static double grad(int hash, double x, double y, double z) {
      int h = hash & 15;                      // CONVERT LO 4 BITS OF HASH CODE
      double u = h<8 ? x : y,                 // INTO 12 GRADIENT DIRECTIONS.
             v = h<4 ? y : h==12||h==14 ? x : z;
      return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
   }
   static final int p[] = new int[512], permutation[] = { 151,160,137,91,90,15,
   131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
   190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
   88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
   77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
   102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
   135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
   5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
   223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
   129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
   251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
   49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
   138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
   };
   static { for (int i=0; i < 256 ; i++) p[256+i] = p[i] = permutation[i]; }
}
*/

/* Abdelrahman Said:
In 2D, we only need 4 gradient vectors. Similar to the 3D reference implementation,
I chose vectors that go from the center of the unit square to the midpoints of each of its edges.
This results in the following vectors:

( 1,  0)
(-1,  0)
( 0,  1)
( 0, -1)

To get one of these vectors and calculate the dot product for each of the square’s corners, 
this is the function I use:

f32 gradient_vector_2d(u32 hash, f32 x, f32 y) {
  u32 h = hash & 3;
  if (h == 0) {
    // gradient vector is (1, 0)
    // (1, 0) . (x, y) = x + 0 = x
    return  x;
  }

  if (h == 1) {
    // gradient vector is (-1, 0)
    // (-1, 0) . (x, y) = -x + 0 = -x
    return -x;
  }

  if (h == 2) {
    // gradient vector is (0, 1)
    // (0, 1) . (x, y) = 0 + y = y
    return  y;
  }
  
  // gradient vector is (0, -1)
  // (0, -1) . (x, y) = 0 - y = -y
  return -y;
}

And this is the implementation of the noise function itself. As you can see, 
I use a permutation table that is double the size of the one Ken Perlin used.

#define PERMUTATION_COUNT 512

u32 generate_random_u32(u32 min, u32 max) {
  // using rand() for demonstration purposes only
  return (u32)(rand() % (max - min) + min);
}

void shuffle(u32 *array, u32 count) {
  u32 j;
  u32 tmp;
  for (u32 i = count - 1; i >= 1; --i) {
    j        = generate_random_u32(0, i);
    tmp      = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}

i32 main(void) {
  // fill temp array with indices
  u32 tmp[PERMUTATION_COUNT] = {};
  for (u32 i = 0; i < PERMUTATION_COUNT; ++i) { tmp[i] = i; }
  
  shuffle(tmp, PERMUTATION_COUNT);
  
  // fill the permutations table
  for (u32 i = 0; i < PERMUTATION_COUNT; ++i) {
    perlin_permutations[i] = perlin_permutations[PERMUTATION_COUNT + i] = tmp[i];
  }
}

f32 perlin_noise_2d(f32 x, f32 y) {
  f32 fx = floorf(x);
  f32 fy = floorf(y);

  u32 xu = (u32)fx & (PERMUTATION_COUNT - 1);
  u32 yu = (u32)fy & (PERMUTATION_COUNT - 1);

  x -= fx;
  y -= fy;

  u32 a = perlin_permutations[xu    ] + yu;
  u32 b = perlin_permutations[xu + 1] + yu;

  f32 u = fade(x);
  f32 v = fade(y);

  return lerp(v, lerp(u, gradient_vector_2d(perlin_permutations[a    ], x    , y    ),
                         gradient_vector_2d(perlin_permutations[b    ], x - 1, y    )),
                 lerp(u, gradient_vector_2d(perlin_permutations[a + 1], x    , y - 1),
                         gradient_vector_2d(perlin_permutations[b + 1], x - 1, y - 1)));
}

=======================
FULL IMPLEMENTATION:
=======================
/*
    perlin2d.c

    Self-contained 2D Perlin noise implementation based on the
    "Breaking Down Perlin Noise Reference Implementation" article.

    Build:
        gcc -O2 perlin2d.c -lm

    Usage:
        perlin_init(1337);

        float n = perlin_noise_2d(x, y);

    Output range is approximately [-1, 1].
-----------------------------------------------------------------------

#include <stdint.h>
#include <math.h>

typedef float    f32;
typedef uint32_t u32;

#define PERMUTATION_COUNT 256

static u32 perlin_permutations[PERMUTATION_COUNT * 2];

----------------------------------------------------------------------
    Simple deterministic PRNG
----------------------------------------------------------------------

static u32 rng_state = 1;

static u32 random_u32(void)
{
    /* xorshift32
    u32 x = rng_state;

    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;

    rng_state = x;
    return x;
}

----------------------------------------------------------------------
    Fisher-Yates shuffle
----------------------------------------------------------------------

static void shuffle(u32 *array, u32 count)
{
    if (count <= 1)
        return;

    for (u32 i = count - 1; i > 0; --i)
    {
        u32 j = random_u32() % (i + 1);

        u32 tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
}

----------------------------------------------------------------------
    Fade curve

    6t^5 - 15t^4 + 10t^3
----------------------------------------------------------------------

static inline f32 fade(f32 t)
{
    return t * t * t *
           (t * (t * 6.0f - 15.0f) + 10.0f);
}

----------------------------------------------------------------------
    Linear interpolation

    a + t(b - a)
----------------------------------------------------------------------

static inline f32 lerp(f32 t, f32 a, f32 b)
{
    return a + t * (b - a);
}

----------------------------------------------------------------------
    Gradient lookup

    Uses four axis-aligned gradients:

        ( 1, 0)
        (-1, 0)
        ( 0, 1)
        ( 0,-1)

    Returns gradient · distance
----------------------------------------------------------------------

static inline f32 gradient_vector_2d(u32 hash, f32 x, f32 y)
{
    switch (hash & 3)
    {
        case 0: return  x;
        case 1: return -x;
        case 2: return  y;
        default: return -y;
    }
}

----------------------------------------------------------------------
    Initialize permutation table

    Call once before generating noise.
----------------------------------------------------------------------

void perlin_init(u32 seed)
{
    rng_state = seed ? seed : 1;

    u32 tmp[PERMUTATION_COUNT];

    for (u32 i = 0; i < PERMUTATION_COUNT; ++i)
        tmp[i] = i;

    shuffle(tmp, PERMUTATION_COUNT);

    for (u32 i = 0; i < PERMUTATION_COUNT; ++i)
    {
        perlin_permutations[i] =
        perlin_permutations[PERMUTATION_COUNT + i] =
            tmp[i];
    }
}

----------------------------------------------------------------------
    2D Perlin noise

    Returns approximately in [-1, 1].
----------------------------------------------------------------------

f32 perlin_noise_2d(f32 x, f32 y)
{
    f32 fx = floorf(x);
    f32 fy = floorf(y);

    u32 xu = (u32)fx & (PERMUTATION_COUNT - 1);
    u32 yu = (u32)fy & (PERMUTATION_COUNT - 1);

    x -= fx;
    y -= fy;

    u32 a = perlin_permutations[xu]     + yu;
    u32 b = perlin_permutations[xu + 1] + yu;

    f32 u = fade(x);
    f32 v = fade(y);

    f32 g00 =
        gradient_vector_2d(
            perlin_permutations[a],
            x,
            y);

    f32 g10 =
        gradient_vector_2d(
            perlin_permutations[b],
            x - 1.0f,
            y);

    f32 g01 =
        gradient_vector_2d(
            perlin_permutations[a + 1],
            x,
            y - 1.0f);

    f32 g11 =
        gradient_vector_2d(
            perlin_permutations[b + 1],
            x - 1.0f,
            y - 1.0f);

    return lerp(
        v,
        lerp(u, g00, g10),
        lerp(u, g01, g11)
    );
}

----------------------------------------------------------------------
    Optional fractal Brownian motion (fBm)

    Useful for terrain and textures.
----------------------------------------------------------------------

f32 perlin_fbm_2d(
    f32 x,
    f32 y,
    int octaves,
    f32 lacunarity,
    f32 gain)
{
    f32 sum = 0.0f;
    f32 amplitude = 1.0f;
    f32 frequency = 1.0f;

    f32 normalization = 0.0f;

    for (int i = 0; i < octaves; ++i)
    {
        sum += amplitude *
               perlin_noise_2d(
                   x * frequency,
                   y * frequency);

        normalization += amplitude;

        amplitude *= gain;
        frequency *= lacunarity;
    }

    return sum / normalization;
}

----------------------------------------------------------------------
    Example

    #include <stdio.h>

    int main(void)
    {
        perlin_init(1337);

        for (int y = 0; y < 10; ++y)
        {
            for (int x = 0; x < 10; ++x)
            {
                float n =
                    perlin_noise_2d(
                        x * 0.1f,
                        y * 0.1f);

                printf("% .3f ", n);
            }

            printf("\n");
        }

        return 0;
    }
----------------------------------------------------------------------*/

