use anchor_lang::error_code;
use constant_product_curve::CurveError;
// use solana_program::program_error::ProgramError;


#[error_code]
pub enum AmmError {
    #[msg("Invalid Config")]
    InvalidConfig,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Pool is Locked")]
    PoolLocked,
    #[msg("Insufficient amount of token X")]
    InsufficientTokenX,
    #[msg("Insufficient amount of token Y")]
    InsufficientTokenY,
    #[msg("Insufficient Balance")]
    InsufficientBalance,
    #[msg("Slippage limit exceeded")]
    SlippageExceeded,
    #[msg("Insufficient Liquidity")]
    InsufficientLiquidity,
    #[msg("Unauthorized")]
    Unauthorized,
}

// TODO: Understand how the From trait works in Rust
impl From<CurveError> for AmmError {
    fn from(error: CurveError) -> AmmError {
        match error {
            CurveError::InvalidPrecision => AmmError::InvalidAmount,
            CurveError::Overflow => AmmError::InvalidAmount,
            CurveError::Underflow => AmmError::InvalidAmount,
            CurveError::InvalidFeeAmount => AmmError::InvalidAmount,
            CurveError::InsufficientBalance => AmmError::InsufficientBalance,
            CurveError::ZeroBalance => AmmError::InvalidAmount,
            CurveError::SlippageLimitExceeded => AmmError::SlippageExceeded,
        }
    }
}