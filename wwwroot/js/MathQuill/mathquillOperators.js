export var operators = [
    ["\\frac{x}{y}", "\\frac"], // Fraction
    ["x^2", "^2"], // Squared
    ["x^n", "^{}"], // Power of n
    ["\\sqrt{x}", "\\sqrt"], // Square root
    ["\\sqrt[n]{x}", "\\nthroot"], // nth root
    ["\\infty", "\\infty"], // Infinity
    ["-\\infty", "-\\infty"], // Negative Infinity
    ["e", "e"], // Euler's number
    ["e^x", "e^{}"], // Exponential function
    ["\\ln", "\\ln"], // Natural logarithm
    ["\\log", "\\log"], // Logarithm base 10
    ["\\log_n", "\\log_{}"], // Logarithm with base
    ["\\left|x\\right|", "\\left|\\right|"], // Absolute value
    ["\\lceil x \\rceil", "\\lceil \\rceil"], // Ceiling function
    ["\\lfloor x \\rfloor", "\\lfloor \\rfloor"], // Floor function
    ["\\frac{d}{dx}", "\\frac{d}{dx}"], // Derivative
    ["\\frac{d^{2}}{d^{2}x}", "\\frac{d^{2}}{d^{2}x}"], // Second derivative
    ["\\partial", "\\partial"], // Partial derivative
    ["\\frac{\\partial}{\\partial x}", "\\frac{\\partial}{\\partial x}"], // Partial derivative with respect to x
    ["\\frac{\\partial^2}{\\partial^2 x}", "\\frac{\\partial^2}{\\partial^2 x}"], // Second partial derivative with respect to x
    ["\\int", "\\int"], // Integral
    ["\\sum", "\\sum"], // Summation
    ["\\prod", "\\prod"], // Product
    ["\\lim_{}", "\\lim_{}"], // Limit
    ["\\pi", "\\pi"], // Pi
    ["^{\\circ}", "^{\\circ}"], // Degrees
    ["\\text{rad}", "\\text{rad}"], // Radians
    ["\\sin", "\\sin"], // Sine
    ["\\cos", "\\cos"], // Cosine
    ["\\tan", "\\tan"], // Tangent
    ["\\sec", "\\sec"], // Secant
    ["\\csc", "\\csc"], // Cosecant
    ["\\cot", "\\cot"], // Cotangent
    ["\\sin^{-1}", "\\sin^{-1}"], // Arcsine
    ["\\cos^{-1}", "\\cos^{-1}"], // Arccosine
    ["\\tan^{-1}", "\\tan^{-1}"], // Arctangent
    ["\\forall", "\\forall"], // For all
    ["\\exists", "\\exists"], // There exists
    ["\\cup", "\\cup"], // Union
    ["\\cap", "\\cap"], // Intersection
    ["\\nabla", "\\nabla"], // Nabla
    ["\\Delta", "\\Delta"], // Delta
    ["\\alpha", "\\alpha"], // Alpha
    ["\\beta", "\\beta"], // Beta
    ["\\gamma", "\\gamma"], // Gamma
    ["\\delta", "\\delta"], // Delta (lowercase)
    ["\\epsilon", "\\epsilon"], // Epsilon
    ["\\zeta", "\\zeta"], // Zeta
    ["\\eta", "\\eta"], // Eta
    ["\\theta", "\\theta"], // Theta
    ["\\kappa", "\\kappa"], // Kappa
    ["\\lambda", "\\lambda"], // Lambda
    ["\\mu", "\\mu"], // Mu
    ["\\nu", "\\nu"], // Nu
    ["\\xi", "\\xi"], // Xi
    ["\\rho", "\\rho"], // Rho
    ["\\sigma", "\\sigma"], // Sigma
    ["\\tau", "\\tau"], // Tau
    ["\\phi", "\\phi"], // Phi
    ["\\chi", "\\chi"], // Chi
    ["\\psi", "\\psi"], // Psi
    ["\\omega", "\\omega"], // Omega
    ["\\Gamma", "\\Gamma"], // Gamma (uppercase)
    ["\\Theta", "\\Theta"], // Theta (uppercase)
    ["\\Lambda", "\\Lambda"], // Lambda (uppercase)
    ["\\Xi", "\\Xi"], // Xi (uppercase)
    ["\\Upsilon", "\\Upsilon"], // Upsilon (uppercase)
    ["\\Phi", "\\Phi"], // Phi (uppercase)
    ["\\Psi", "\\Psi"], // Psi (uppercase)
    ["\\Omega", "\\Omega"], // Omega (uppercase)
    ["\\hslash", "\\hslash"], // Planck constant over 2 pi
    ["\\AA", "\\AA"], // Angstrom
    ["\\hbar", "\\hbar"], // Reduced Planck constant
    ["\\aleph", "\\aleph"], // Aleph
    ["\\to", "\\to"], // Implies / To
    ["\\oplus", "\\oplus"], // Circled plus
    ["\\odot", "\\odot"], // Circled dot operator
    ["\\neq", "\\neq"], // Not equal to
    ["\\geq", "\\geq"], // Greater than or equal to
    ["\\leq", "\\leq"] // Less than or equal to
]