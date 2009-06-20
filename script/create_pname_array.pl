#!perl

use strict;
use IO::File;

my $file = shift @ARGV || 'pname.txt';

my @p;

my $fh = IO::File->new( $file ) or die $!;
while( defined( my $line = $fh->getline ) ){
	chomp $line;
	$line =~ s/^\s+//go;
	$line =~ s/\s+$//go;
 	next if $line eq '';
	
	$line =~ s/"/\\"/go;
	push @p, $line;
}

printf qq|settings["exceptionPTagsVO"] = ["",%s,""];\n|, join ',', map { sprintf q|"%s"|, $_ } @p;

__END__

