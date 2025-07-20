use anchor_lang::error_code;


#[error_code]
pub enum MarketplaceError {
    #[msg("Name is Too Long")]
    NameTooLong,
    #[msg("Collection is not Valid")]
    InvalidCollection,
    #[msg("Collection is not Verified")]
    UnverifedCollection,
    #[msg("Numerical Overflow")]
    NumericalOverflow,
}