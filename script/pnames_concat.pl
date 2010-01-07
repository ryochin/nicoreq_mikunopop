#!perl
# usage: ./script/pnames_concat.pl > pnames.js

use strict;
use warnings;
use IO::File;
use IO::Dir;
use File::Spec;

my $base_dir = shift @ARGV || "./pnames";

my $pname = {};
my $d = IO::Dir->new( $base_dir ) or die $!;
while( defined( my $f = $d->read ) ){
	next if $f !~ /\.js$/io;
	my $file = File::Spec->join( $base_dir => $f );
	
	my $fh = IO::File->new( $file ) or die $!;
	while( defined( my $line = $fh->getline ) ){
		chomp $line;
		next if $line !~ /^\t/o;
		$line =~ s/\t*["']//o;
		$line =~ s/["'],.*$//o;
		
		# set
		$pname->{ $line } = 1;    # for uniq
	}
}

my @result;
push @result, '// P名のリストです。';
push @result, 'settings["exceptionPTagsVO"] = ["",';

for my $name( sort keys %{ $pname } ){
	$name =~ s{'}{\\'}go if $name =~ /'/o;
	push @result, sprintf qq{\t'%s',}, $name;
}

push @result, qq{\t};
push @result, qq{\t// ここから追加してください。};
push @result, qq{\t};

push @result, "''];";

# out
print join("\r\n", @result);

printf STDERR "total %d names.\n", scalar keys %{ $pname };
exit 0;

__END__
