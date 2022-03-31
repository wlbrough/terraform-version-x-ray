terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.74.0"
    }
    azure = {
      source = "hashicorp/azurerm"
      version = ">= 3.0.0"
    }
    gcp = {
      source = "hashicorp/google"
      version = "< 4.0.0"
    }
    consul = {
      source  = "hashicorp/consul"
      version = "~> 2.7"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

# Create a VPC
resource "aws_vpc" "example" {
  cidr_block = "10.0.0.0/16"
}