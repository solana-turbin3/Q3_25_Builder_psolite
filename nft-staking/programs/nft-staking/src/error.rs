use anchor_lang::error_code;

#[error_code]
pub enum StakeError {
    #[msg("Invalid Config")]
    InvalidConfig,
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Time Not Elapsed")]
    TimeNotElapsed,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Max Stake Exceeded")]
    MaxStakeExceeded,
}
