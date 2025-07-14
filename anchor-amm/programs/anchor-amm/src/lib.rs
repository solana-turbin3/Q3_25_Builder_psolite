#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

mod instructions;
mod state;
mod error;

use instructions::*;

declare_id!("ARje6fToWBZ3ivJxZpi5CQg2XVkemTEGdZRAAqBkgaaX");

#[program]
pub mod anchor_amm {

    use super::*;

    pub fn initialize(ctx: Context<Initialize>, seed: u64, fee: u16, authority: Option<Pubkey>) -> Result<()> {
        ctx.accounts.init(
            seed,
            fee,
            authority,
            ctx.bumps
        )?;
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, max_x: u64, max_y: u64) -> Result<()> {
        ctx.accounts.deposit(
            amount,
            max_x,
            max_y
        )?;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, min_x: u64, min_y: u64,) -> Result<()> {
        ctx.accounts.withdraw(
            amount,
            min_x,
            min_y
        )?;
        Ok(())
    }

    

}
