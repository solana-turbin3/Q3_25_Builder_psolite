#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;

declare_id!("28J49xeyAoue6zEE7K6Cu2AWVMcm17mEAwzrxZ88Hj97");

#[program]
pub mod anchor_escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, receive: u64, deposit: u64) -> Result<()> {
        ctx.accounts.init_escrow(seed, receive, &ctx.bumps)?;
        ctx.accounts.deposit(deposit)?;
        Ok(())
    }

    pub fn take(ctx: Context<Take>) -> Result<()> {
        ctx.accounts.transfer()?;
        ctx.accounts.withdraw_and_close_vault()?;
        Ok(())
    }
}
