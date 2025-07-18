use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        mpl_token_metadata::instructions::{
            ThawDelegatedAccountCpi, ThawDelegatedAccountCpiAccounts,
        },
        MasterEditionAccount, Metadata,
    },
    token::{revoke, Mint, Revoke, Token, TokenAccount},
};

use crate::{
    error::StakeError,
    state::{StakeAccount, StakeConfig, UserAccount},
};

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub mint: Account<'info, Mint>,

    // pub collection_mint: Account<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = user,
    )]
    pub user_ata: Account<'info, TokenAccount>,

    
    #[account(
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            mint.key().as_ref(),
            b"edition"
        ],
        seeds::program = metadata_program.key(),
        bump
    )]
    pub edition: Account<'info, MasterEditionAccount>,

    #[account(
        seeds =[b"config"],
        bump = config.bump,
    )]
    pub config: Account<'info, StakeConfig>,

    #[account(
        mut,
        seeds = [b"user", user.key().as_ref()],
        bump = user_account.bump
    )]
    pub user_account: Account<'info, UserAccount>,

    #[account(
        mut,
        seeds = [b"stake", mint.key().as_ref(), config.key().as_ref()],
        bump,
        close = user
    )]
    pub stake_account: Account<'info, StakeAccount>,

    pub metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

impl<'info> Unstake<'info> {
    pub fn unstake(&mut self) -> Result<()> {
        let time_elapsed =
        // For testing purposes, I used seconds
        (Clock::get()?.unix_timestamp - self.stake_account.staked_at) as u32;

        // // For Days
        // ((Clock::get()?.unix_timestamp - self.stake_account.staked_at) / 86400) as u32;

        require!(
            time_elapsed >= self.config.freeze_period,
            StakeError::TimeNotElapsed
        );

        self.user_account.points += (self.config.points_per_stake as u32) * time_elapsed;

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = ThawDelegatedAccountCpiAccounts {
            mint: &self.mint.to_account_info(),
            delegate: &self.stake_account.to_account_info(),
            edition: &self.edition.to_account_info(),
            token_account: &self.user_ata.to_account_info(),
            token_program: &self.token_program.to_account_info(),
        };

        let seeds = &[
            b"stake",
            self.mint.to_account_info().key.as_ref(),
            self.config.to_account_info().key.as_ref(),
            &[self.stake_account.bump],
        ];

        let signer_seeds = &[&seeds[..]];

        let _ =
            ThawDelegatedAccountCpi::new(&self.metadata_program.to_account_info(), cpi_accounts)
                .invoke_signed(signer_seeds);

        let cpi_accounts = Revoke {
            source: self.user_ata.to_account_info(),
            authority: self.user.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        let _ = revoke(cpi_ctx);


        Ok(())
    }
}
