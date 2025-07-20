use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::{error::MarketplaceError, state::Marketplace};

#[derive(Accounts)]
#[instruction( name: String, fee: u8)]

pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"marketplace", name.as_bytes()],
        bump,
        space = 8 + Marketplace::INIT_SPACE + 4 + 37
    )]
    pub marketplace: Account<'info, Marketplace>,

    #[account(
        mut,
        seeds = [b"treasury", marketplace.key().as_ref()],
        bump,
    )]
    pub treasury: SystemAccount<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"rewards", marketplace.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = marketplace,
    )]
    pub reward_mint: InterfaceAccount<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,

}

impl<'info> Initialize<'info> {
    pub fn init(&mut self, name: String, fee: u8, bumps: &InitializeBumps) -> Result<()> {
        require!(
            name.len() > 0 &&
            name.len() <= 4 + 33,
            MarketplaceError::NameTooLong 
        );

        self.marketplace.set_inner(
            Marketplace { 
                admin: self.admin.key(),
                fee,
                name,
                bump: bumps.marketplace,
                treasury_bump: bumps.treasury,
                rewards_bump: bumps.reward_mint
            }
        );

        Ok(())
    }
}